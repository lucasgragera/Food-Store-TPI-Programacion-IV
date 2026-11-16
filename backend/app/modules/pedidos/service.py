from app.core.database import utcnow
from app.modules.pedidos.models import DetallePedido, EstadoPedido, Pedido
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork


# ---- Excepciones de dominio -------------------------------------------------
class PedidoNoEncontrado(Exception):
    pass


class ProductoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class StockInsuficiente(Exception):
    pass


class ProductoNoDisponible(Exception):
    pass


class ProductoRepetido(Exception):
    pass


class TransicionInvalida(Exception):
    pass


# Mapa de la maquina de estados (RN-02). Los estados terminales no tienen salida.
TRANSICIONES: dict[str, set[str]] = {
    EstadoPedido.PENDIENTE.value: {
        EstadoPedido.EN_PREPARACION.value,
        EstadoPedido.CANCELADO.value,
    },
    EstadoPedido.EN_PREPARACION.value: {
        EstadoPedido.ENTREGADO.value,
        EstadoPedido.CANCELADO.value,
    },
    EstadoPedido.ENTREGADO.value: set(),
    EstadoPedido.CANCELADO.value: set(),
}


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork | None = None):
        self.uow = uow or PedidoUnitOfWork()

    # ---- RN-01: crear pedido ------------------------------------------------
    def crear(self, usuario_id: int, data: PedidoCreate) -> PedidoRead:
        with self.uow as uow:
            ids = [item.producto_id for item in data.items]
            if len(ids) != len(set(ids)):
                raise ProductoRepetido("No se puede repetir un producto en el pedido")

            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario_id,
                    estado=EstadoPedido.PENDIENTE.value,
                    forma_pago=data.forma_pago.value,
                    direccion_entrega=data.direccion_entrega,
                    notas=data.notas,
                    total=0.0,
                )
            )

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(f"Producto {item.producto_id} no encontrado")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"El producto '{producto.nombre}' no esta disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}' "
                        f"(disponible: {producto.stock})"
                    )
                producto.stock -= item.cantidad
                uow.productos.add(producto)
                subtotal = round(producto.precio_base * item.cantidad, 2)
                uow.pedidos.add_detalle(
                    DetallePedido(
                        pedido_id=pedido.id,
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.pedidos.add(pedido)
            uow.session.refresh(pedido)
            return PedidoRead.model_validate(pedido)

    # ---- Lecturas -------------------------------------------------------------
    def listar(
        self, usuario_id: int, es_admin: bool, skip: int, limit: int, estado: str | None
    ) -> PedidosPaginados:
        with self.uow as uow:
            items, total = uow.pedidos.list_paginado(
                skip, limit, estado=estado, usuario_id=None if es_admin else usuario_id
            )
            return PedidosPaginados(
                total=total, items=[PedidoRead.model_validate(p) for p in items]
            )

    def obtener(self, pedido_id: int, usuario_id: int, es_admin: bool) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado()
            if not es_admin and pedido.usuario_id != usuario_id:
                raise PedidoAjeno()
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            por_estado = uow.pedidos.count_by_estado()
            hoy = utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            return ResumenPedidos(
                pendientes=por_estado.get(EstadoPedido.PENDIENTE.value, 0),
                en_preparacion=por_estado.get(EstadoPedido.EN_PREPARACION.value, 0),
                entregados=por_estado.get(EstadoPedido.ENTREGADO.value, 0),
                cancelados=por_estado.get(EstadoPedido.CANCELADO.value, 0),
                pedidos_hoy=uow.pedidos.count_desde(hoy),
                ingresos_entregados=uow.pedidos.sum_total_por_estado(
                    EstadoPedido.ENTREGADO.value
                ),
            )

    # ---- RN-02 / RN-03: transiciones y cancelacion ----------------------------
    def _transicionar(self, uow: PedidoUnitOfWork, pedido: Pedido, nuevo: str) -> None:
        permitidos = TRANSICIONES.get(pedido.estado, set())
        if nuevo not in permitidos:
            raise TransicionInvalida(f"Transicion invalida: {pedido.estado} -> {nuevo}")
        if nuevo == EstadoPedido.CANCELADO.value:
            for linea in pedido.items:
                producto = uow.productos.get_by_id(linea.producto_id)
                if producto is not None:
                    producto.stock += linea.cantidad
                    uow.productos.add(producto)
        pedido.estado = nuevo
        pedido.updated_at = utcnow()
        uow.pedidos.add(pedido)

    def cambiar_estado(self, pedido_id: int, nuevo_estado: EstadoPedido) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado()
            self._transicionar(uow, pedido, nuevo_estado.value)
            return PedidoRead.model_validate(pedido)

    def cancelar(self, pedido_id: int, usuario_id: int) -> PedidoRead:
        """Cancelacion por el cliente dueno, solo desde PENDIENTE (RN-04)."""
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado()
            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno()
            if pedido.estado != EstadoPedido.PENDIENTE.value:
                raise TransicionInvalida("Solo se puede cancelar un pedido PENDIENTE")
            self._transicionar(uow, pedido, EstadoPedido.CANCELADO.value)
            return PedidoRead.model_validate(pedido)

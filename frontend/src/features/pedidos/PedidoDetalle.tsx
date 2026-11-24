import type { Pedido } from '../../shared/api/types'
import { moneda } from '../../shared/api/format'
import { BadgeEstado } from '../../shared/ui/BadgeEstado'

export function PedidoDetalle({ pedido }: { pedido: Pedido }) {
  return (
    <div className="space-y-4">
      <BadgeEstado estado={pedido.estado} />

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-bold">Fecha</dt>
          <dd>{new Date(pedido.created_at).toLocaleString('es-AR')}</dd>
        </div>

        <div>
          <dt className="font-bold">Forma de pago</dt>
          <dd>{pedido.forma_pago}</dd>
        </div>

        <div>
          <dt className="font-bold">Direccion</dt>
          <dd>{pedido.direccion_entrega}</dd>
        </div>

        <div>
          <dt className="font-bold">Notas</dt>
          <dd>{pedido.notas || 'Sin notas'}</dd>
        </div>
      </dl>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3">Producto</th>
              <th className="p-3">Cantidad</th>
              <th className="p-3">Precio</th>
              <th className="p-3">Subtotal</th>
            </tr>
          </thead>

          <tbody>
            {pedido.items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="p-3">{item.nombre_producto}</td>
                <td className="p-3">{item.cantidad}</td>
                <td className="p-3">{moneda(item.precio_unitario)}</td>
                <td className="p-3">{moneda(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-right text-2xl font-black">
        Total: {moneda(pedido.total)}
      </p>
    </div>
  )
}

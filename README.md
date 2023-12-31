# Backend-ProyectoFinal
### Actualización 31/10/2023
## Nuevas funcionalidades 

El proyecto ahora incluye las siguientes funcionalidades:

- Autenticación y autorización a endpoints mediante JWT.
- Model y manager de Tickets.
- Endpoint ```/api/carts/:cid/purchase```
  - Actualiza stock de productos.
  - Actualiza el carrito con productos fuera de stock.
  - Genera ticket de compra.

## Uso

1. Descarga o clona este repositorio a tu máquina local:
   ```bash
   git clone -b entrega/clase_30 https://github.com/santiago-sanguinetti/Backend-ProyectoFinal.git
   ```
2. Abre una terminal en la ubicación del repositorio clonado.
   
3. Instala las dependencias utilizando npm:
   ```bash
   npm install
   ```
4. Inicia el servidor con 
   ```bash
   npm start
   ```
# 🧠 Senku Loyalty - Backend

Backend oficial para la plataforma de lealtad **Senku**, construido con Node.js, Fastify, Prisma y PostgreSQL. Diseñado para ser API-first, modular y escalable desde el MVP.

---

## 🚀 Stack Tecnológico

- **Node.js** con Fastify
- **Prisma** ORM
- **PostgreSQL** como base de datos
- **JWT** para autenticación
- **dotenv** para configuración de entorno

---

## 📁 Estructura del Proyecto

```
senku-backend/
│
├── prisma/                # Esquema y migraciones de la base de datos
│   └── schema.prisma
│
├── src/
│   ├── index.js           # Archivo principal que levanta el servidor
│   ├── routes/            # Rutas HTTP (auth, clientes, etc.)
│   └── services/          # Servicios como generación de OTP
│
├── .env                   # Variables de entorno locales
├── .env.example           # Plantilla para entorno
├── package.json
└── README.md              # Este archivo :)
```

---

## 🔐 Variables de Entorno (`.env`)

```env
DATABASE_URL="postgresql://senku_user:senku_pass@localhost:5432/senku"
JWT_SECRET="senkuSuperSecret"
```

---

## 📡 Endpoints Implementados

### 🔸 POST `/auth/init`

**Descripción:**  
Inicia el proceso de autenticación por teléfono. Si el cliente existe, se genera un OTP válido por 5 minutos.

**Body esperado:**

```json
{
  "phone": "88888888"
}
```

**Respuestas:**
- ✅ `200 OK` → OTP generado
- ❌ `400 Bad Request` → Teléfono faltante
- ❌ `404 Not Found` → Cliente no registrado

---

### 🔸 POST /auth/verify
Descripción:
Valida el OTP ingresado por el cliente, lo marca como verificado y devuelve un token JWT.

Body esperado:

json
Copy
{
  "phone": "88888888",
  "otp": "123456"
}
Respuestas:

✅ 200 OK → JWT generado

json
Copy
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
❌ 400 Bad Request → Faltan datos:

json
Copy
{ "error": "Teléfono y OTP requeridos" }
❌ 401 Unauthorized → OTP inválido o expirado:

json
Copy
{ "error": "OTP inválido o expirado" }
❌ 404 Not Found → Cliente no existe:

json
Copy
{ "error": "Cliente no encontrado" }


---

### 🔸 POST `/customers`

**Descripción:**  
Registra un nuevo cliente con teléfono, número de identificación, nombre y comercio.  
Genera un OTP automáticamente al registrarlo.

**Body esperado:**

```json
{
  "phone": "77777777",
  "idNumber": "01-1234-5678",
  "name": "Mario Programador",
  "merchantId": "ABC123"
}
Respuestas:

✅ 200 OK → Cliente creado

json
Copy
{ "message": "Cliente registrado, OTP generado", "otp": "123456" 
}
❌ 400 Bad Request → Falta algún campo o formato de ID inválido

❌ 409 Conflict → Teléfono ya registrado

---

### 🔸 POST `/programs`

**Descripción:**  
Crea un nuevo programa de lealtad del tipo `POINTS`, `CASHBACK` o `STAMPS`.  
El campo `config` es un objeto JSON que define las reglas del programa, y su estructura varía según el tipo.

> ⚠️ Actualmente `merchantId` está seteado temporalmente como un string plano (`TEMP_MERCHANT`), hasta que se integre el modelo `Merchant`.

---

**Body esperado:**

```json
{
  "type": "POINTS",
  "name": "Puntos Ferretería Pato",
  "config": {
    "pointsPerColones": 1000,
    "redeemRate": 10
  }
}
```

---

**Tipos válidos de programa (`type`):**
- `POINTS`
- `CASHBACK`
- `STAMPS`

---

**Respuestas:**

✅ `200 OK` → Programa creado con éxito

```json
{
  "message": "Programa creado",
  "program": {
    "id": "clxyz123abc",
    "type": "POINTS",
    "name": "Puntos Ferretería Pato",
    "config": {
      "pointsPerColones": 1000,
      "redeemRate": 10
    },
    "merchantId": "TEMP_MERCHANT",
    "createdAt": "2025-04-20T22:59:00.000Z",
    "updatedAt": "2025-04-20T22:59:00.000Z"
  }
}
```

❌ `400 Bad Request` → Campos faltantes o tipo inválido

```json
{ "error": "Todos los campos son requeridos" }
```

```json
{ "error": "Tipo de programa inválido" }
```

### 🧱 Modelo `CustomerProgram` actualizado

El modelo `CustomerProgram` ahora incluye soporte para la integración con Google Wallet y Apple Wallet mediante los siguientes campos:

- `walletPassId`: Identificador único del pase digital (ej. `senku-cus123-prog456`)
- `walletPlatform`: Plataforma donde fue emitido el pase (`APPLE` o `GOOGLE`)

Estos campos permitirán generar, asociar y actualizar los pases correctamente con las APIs de PassKit o Google Wallet.

**Nuevos campos en base de datos:**

```prisma
walletPassId     String?  @unique
walletPlatform   WalletPlatform?

enum WalletPlatform {
  APPLE
  GOOGLE
}
```

Estos campos están presentes en el modelo `CustomerProgram`, ya que un mismo cliente puede estar inscrito en múltiples programas y necesita un pase digital por cada uno.

### 🔸 GET `/me/programs`

**Descripción:**  
Devuelve todos los programas de lealtad en los que el cliente autenticado está inscrito, incluyendo saldos y datos del pase digital (si existe).

---

**Headers requeridos:**

```
Authorization: Bearer <tu_token_jwt>
```

---

**Respuestas:**

✅ `200 OK` → Lista de programas

```json
{
  "programs": [
    {
      "programId": "clprog123",
      "name": "Puntos La Esquina",
      "type": "POINTS",
      "pointsBalance": 60,
      "cashbackBalance": 0,
      "stampsBalance": 0,
      "walletPassId": "senku-clcus123-clprog123",
      "walletPlatform": "APPLE"
    }
  ]
}
```

❌ `401 Unauthorized` → Token faltante o inválido

### 🔸 POST `/programs/:programId/earn`

**Descripción:**  
Registra una transacción de acumulación de recompensas según el tipo de programa (`POINTS`, `CASHBACK`, `STAMPS`) para un cliente inscrito.

---

**Parámetros de ruta:**
- `programId`: ID del programa de lealtad

---

**Body esperado:**

```json
{
  "customerId": "cus_abc123",
  "amount": 10000,
  "description": "Compra en tienda"
}
```

---

**Respuestas:**

✅ `200 OK` → Recompensa aplicada con éxito

```json
{
  "message": "Recompensa aplicada",
  "saldoActual": {
    "pointsBalance": 10
  },
  "transaccion": {
    "id": "txn_123",
    "type": "EARN",
    "amount": 10,
    "description": "Compra en tienda",
    "createdAt": "2025-04-20T22:59:00.000Z"
  }
}
```

❌ `400 Bad Request` → Faltan datos o tipo de programa inválido  
❌ `404 Not Found` → Programa o inscripción no encontrada

### 🔸 POST `/programs/:programId/redeem`

**Descripción:**  
Redime recompensas acumuladas por un cliente en un programa de lealtad.  
Descuenta puntos, cashback o sellos según el tipo de programa.

---

**Parámetros de ruta:**
- `programId`: ID del programa

---

**Body esperado:**

```json
{
  "customerId": "cus_abc123",
  "amount": 5,
  "description": "Canje por producto"
}
```

> Para `STAMPS`, `amount` se ignora y se descuenta 1 sello.

---

**Respuestas:**

✅ `200 OK` → Recompensa redimida

```json
{
  "message": "Recompensa redimida",
  "nuevoSaldo": {
    "pointsBalance": 5
  },
  "transaccion": {
    "id": "txn_456",
    "type": "REDEEM",
    "amount": 5,
    "description": "Canje por producto",
    "createdAt": "2025-04-20T23:20:00.000Z"
  }
}
```

❌ `400 Bad Request` → Saldo insuficiente o falta `amount`  
❌ `404 Not Found` → Cliente o programa no encontrado


### Como correr el proyecto


### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar entorno

- Copiar `.env.example` → `.env`
- Ajustar credenciales de base de datos

### 3. Migrar la base de datos

```bash
npx prisma migrate dev --name init
```

### 4. Correr el backend

```bash
npm run dev
```

---

## 🧠 Autor

Luis R. | [@tuusuario](https://github.com/tuusuario)

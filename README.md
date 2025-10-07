# Homa Maps

Una aplicación web moderna para explorar y gestionar lugares únicos usando Google Maps, desarrollada con Next.js, TypeScript y Prisma.

## Características

- 🗺️ **Integración con Google Maps**: Visualiza lugares en un mapa interactivo
- 📍 **Gestión de Lugares**: Agrega, edita y elimina lugares personalizados
- 🏷️ **Categorización**: Organiza lugares por categorías
- 📱 **Responsive**: Diseño adaptable para desktop y móvil
- 🔍 **Búsqueda y Filtros**: Encuentra lugares fácilmente
- 💬 **Chatbot AI**: Integración con n8n para asistencia conversacional
- 📊 **Base de Datos**: Persistencia con SQLite/PostgreSQL usando Prisma

## Tecnologías

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Base de Datos**: Prisma ORM + SQLite (desarrollo) / PostgreSQL (producción)
- **Mapas**: Google Maps JavaScript API
- **Deployment**: Vercel (recomendado)

## Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd homa-maps
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Base de datos
DATABASE_URL="file:./dev.db"

# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="tu_api_key_de_google_maps"

# n8n Chatbot (opcional)
NEXT_PUBLIC_N8N_WEBHOOK_URL="https://your-n8n-instance.com/webhook/your-webhook-id"
NEXT_PUBLIC_N8N_API_KEY="your-api-key-here"  # Opcional
```

### 4. Obtener API Key de Google Maps

1. Ve a la [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Maps JavaScript API**
4. Crea credenciales (API Key)
5. Restringe la API key a tu dominio (opcional pero recomendado)
6. Copia la API key y pégala en tu archivo `.env.local`

### 5. Configurar la base de datos

```bash
# Generar el cliente de Prisma
npx prisma generate

# Crear la base de datos
npx prisma db push
```

### 6. Ejecutar en modo desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## Uso

### Agregar un lugar

1. Haz clic en "Agregar Lugar" en la barra lateral
2. Completa la información del lugar:
   - **Nombre** (requerido)
   - **Categoría** (requerido)
   - **Descripción** (requerido)
   - **Coordenadas** (requerido) - puedes usar "Usar mi ubicación actual"
   - Información adicional opcional: dirección, teléfono, sitio web, etc.
3. Haz clic en "Agregar Lugar"

### Ver información de un lugar

- Haz clic en cualquier marcador azul en el mapa
- Se abrirá un modal con toda la información del lugar
- Desde ahí puedes ver el lugar en Google Maps o eliminarlo

### Buscar y filtrar lugares

- Usa la barra de búsqueda en la barra lateral
- Filtra por categoría usando el selector desplegable
- La lista se actualiza automáticamente

### Usar el chatbot

1. Asegúrate de tener configurado `NEXT_PUBLIC_N8N_WEBHOOK_URL` en tu `.env.local`
2. Escribe tu pregunta en la barra de chat en la parte inferior de la pantalla
3. El chatbot responderá usando tu flujo de trabajo n8n
4. Ver [CHAT_SETUP.md](CHAT_SETUP.md) para instrucciones detalladas de configuración

## Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── chat/          # Proxy para n8n chatbot
│   │   │   └── route.ts
│   │   └── places/        # CRUD para lugares
│   ├── globals.css        # Estilos globales
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página principal
├── components/            # Componentes React
│   ├── AddPlaceForm.tsx   # Formulario para agregar lugares
│   ├── ChatInput.tsx      # Barra de chat con n8n
│   ├── ChatWindow.tsx     # Ventana de conversación
│   ├── MapContainer.tsx   # Contenedor del mapa
│   ├── PlaceInfoModal.tsx # Modal de información
│   └── PlacesList.tsx     # Lista de lugares
├── lib/                   # Utilidades
│   ├── n8n.ts             # Integración con n8n
│   └── prisma.ts          # Cliente de Prisma
└── types/                 # Tipos TypeScript
    └── place.ts           # Tipos para lugares

prisma/
└── schema.prisma          # Esquema de la base de datos
```

## Comandos Útiles

```bash
# Desarrollo
npm run dev              # Ejecutar en modo desarrollo
npm run build           # Construir para producción
npm run start           # Ejecutar build de producción
npm run lint            # Linter

# Base de datos
npx prisma studio       # Interfaz visual para la DB
npx prisma db push      # Sincronizar esquema
npx prisma generate     # Regenerar cliente
npx prisma migrate dev  # Crear migración
```

## Deployment

### Vercel (Recomendado)

1. Sube tu código a GitHub
2. Importa el proyecto en [Vercel](https://vercel.com)
3. Configura las variables de entorno:
   - `DATABASE_URL`: URL de tu base de datos PostgreSQL
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Tu API key de Google Maps
4. Despliega

### Railway/Render/DigitalOcean

1. Configura PostgreSQL como base de datos
2. Actualiza `DATABASE_URL` con la URL de PostgreSQL
3. Configura las variables de entorno
4. Ejecuta `npx prisma db push` en producción

## 🔧 Solución de Problemas

### Google Maps no se carga

La aplicación funciona en **modo fallback** si Google Maps no se puede cargar:
- ✅ Lista de lugares funcional
- ✅ Enlaces directos a Google Maps web  
- ✅ Todas las funciones CRUD operativas

Para habilitar el mapa interactivo:
1. Ve a `/setup` para instrucciones detalladas
2. Ve a `/test-maps` para diagnosticar problemas
3. Configura tu API Key en `.env.local`

### Errores comunes

**"API Key no configurado"**: Agrega tu clave en `.env.local`
**"Error 404/CORS"**: Tu API Key no tiene "Maps JavaScript API" habilitada
**"Timeout"**: Verifica tu conexión a internet y cuota de Google Cloud

## 📱 Navegación de la App

- `/` - Página principal con mapa/fallback
- `/setup` - Guía de configuración de Google Maps  
- `/test-maps` - Diagnóstico técnico de la API
- `/api/places` - API REST para lugares

## Próximas Características

- [ ] Autenticación de usuarios
- [ ] Lugares favoritos
- [ ] Compartir lugares
- [ ] Importar/exportar datos
- [ ] Fotos múltiples por lugar
- [ ] Comentarios y reviews
- [ ] Rutas entre lugares

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

MIT License - ver el archivo [LICENSE](LICENSE) para más detalles.

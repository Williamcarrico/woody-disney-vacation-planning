import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { initializeSocketServer } from '@/app/api/socket/route'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

// Prepare Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

export async function startServer() {
    try {
        await app.prepare()

        // Create HTTP server
        const server = createServer(async (req, res) => {
            try {
                const parsedUrl = parse(req.url!, true)
                await handle(req, res, parsedUrl)
            } catch (err) {
                console.error('Error occurred handling', req.url, err)
                res.statusCode = 500
                res.end('internal server error')
            }
        })

        // Initialize Socket.io server
        const io = initializeSocketServer(server)

        // Start the server
        server.listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`)
            console.log(`> Socket.io server initialized`)
        })

        // Handle graceful shutdown
        process.on('SIGTERM', () => {
            console.log('SIGTERM received, shutting down gracefully')
            server.close(() => {
                console.log('Server closed')
                process.exit(0)
            })
        })

        process.on('SIGINT', () => {
            console.log('SIGINT received, shutting down gracefully')
            server.close(() => {
                console.log('Server closed')
                process.exit(0)
            })
        })

        return { server, io }
    } catch (error) {
        console.error('Failed to start server:', error)
        process.exit(1)
    }
}

// Start the server if this file is run directly
if (require.main === module) {
    startServer()
}
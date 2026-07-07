import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { assertDatabaseConnection } from "./db/db.js";
import { logger } from "./lib/logger.js";
import http from "node:http";
import { initIo } from "./realtime/io.js";



async function bootstrap(){
    try {

        await assertDatabaseConnection()

        const app = createApp();
        const server = http.createServer(app);

        const port = Number(env.PORT) || 5000;

        console.log(port);

        initIo(server);

        server.listen(port,()=> {
            logger.info(`Server is running to port: http://localhost${port}`)
        })
        
    } catch (err) {
        console.log(err);
        logger.error('Failed to start the server', `${(err as Error).message}`)
        process.exit(1);
    }
}

bootstrap();
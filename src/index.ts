import express from 'express';
import bearerToken from 'express-bearer-token';
import shell from 'shelljs';

import si from 'systeminformation';

import dotenv from 'dotenv';
dotenv.config();

const TOKEN = process.env.TOKEN;

const app = express();
const port = 8080;
app.use(express.json());
app.use(bearerToken());

app.get('/app/:app', async (req, res) => {
    if (req.token) {
        if (req.token === TOKEN) {
            let pidPM2 = shell.cat(`${process.env.HOME}/.pm2/pids/${req.params.app}*.pid`);
            let pidDocker = shell.exec(`docker inspect -f '{{.State.Pid}}' ${req.params.app}`);
            let container = isDockerRunning(req.params.app);

            if (pidPM2.stderr && (pidDocker.stderr || pidDocker.stderr.startsWith('Error:') || pidDocker.stdout == '0') && !container)
                return res.sendStatus(404);
            else
                return res.sendStatus(200);
        }
    }
    return res.sendStatus(403);
});

app.use((req, res) => {
    res.sendStatus(404);
});

app.listen(port, async () => {
    console.log(`server started at http://localhost:${port}`);
});


async function isDockerRunning(name: string) {
    let containers = await si.dockerContainers(true);
    let container = containers.find(c => c.name === name);

    if(container)
        if(container.state === 'running' || container.state === 'healthy')
            return true;

    return false;
}
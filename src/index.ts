import Client, { Severity } from './client';

const client = new Client();
try {
    client.init().then(r => {});
} catch (err) {
    client.logger.log(Severity.ERROR, err.message);
}
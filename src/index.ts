import Client, { Severity } from './Client';

const client = new Client();
try {
    client.init();
} catch (err) {
    client.logger.log(Severity.ERROR, err.message);
}
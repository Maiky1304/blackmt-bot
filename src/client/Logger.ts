import {Chalk, Instance as ChalkInstance} from 'chalk';

export class Logger {
    public chalk: Chalk = new ChalkInstance();

    public log(type: Severity, message: string, ...args: any[]) {
        const time = new Date().toISOString()
        .replace(/T/, ' ').replace(/\..+/, '').split(' ')[1];
        switch(type) {
            case Severity.INFO:
                console.log(` ${this.chalk.bgCyanBright.black(` ${type.toString()} `)} ${this.chalk.gray(time)} ${message}`, ...args)
                break;
            case Severity.ERROR:
                console.log(` ${this.chalk.bgRedBright.black(` ${type.toString()} `)} ${this.chalk.gray(time)} ${message}`, ...args)
                break;
            case Severity.WARNING:
                console.log(` ${this.chalk.bgYellowBright.black(` ${type.toString()} `)} ${this.chalk.gray(time)} ${message}`, ...args)
                break;
            case Severity.SUCCESS:
                console.log(` ${this.chalk.bgGreenBright.black(` ${type.toString()} `)} ${this.chalk.gray(time)} ${message}`, ...args)
                break;
            default:
                console.log(` ${message}`, args)
        }
    }
}

export enum Severity {
    INFO = 'INFO', WARNING = 'WARNING', ERROR = 'ERROR', SUCCESS = 'SUCCESS'
}
import {Middleware} from "../../../interfaces/Command";
import {TicketModel} from "../../../models";

export const middleware: Middleware = async (channel, member): Promise<boolean> => {
    return await TicketModel.isTicket(channel);
}
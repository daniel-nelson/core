declare module '@ioc:Adonis/Core/Cors' {
    import { RequestContract } from '@ioc:Adonis/Core/Request';
    import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
    type AllowedValuesTypes = boolean | string | string[];
    type CorsConfig = {
        enabled: boolean | ((request: RequestContract, ctx: HttpContextContract) => boolean);
        origin: AllowedValuesTypes | ((origin: string, ctx: HttpContextContract) => AllowedValuesTypes);
        methods: string[];
        headers: AllowedValuesTypes | ((headers: string[], ctx: HttpContextContract) => AllowedValuesTypes);
        exposeHeaders: string[];
        credentials: boolean;
        maxAge: number;
    };
}

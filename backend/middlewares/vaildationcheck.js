const zod = require("zod");
const Varification = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});
module.exports=Varification;

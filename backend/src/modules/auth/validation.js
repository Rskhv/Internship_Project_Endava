const {z}=require('zod');
const email=z.string().trim().email().max(254).transform((value)=>value.toLowerCase());
const registerSchema=z.object({email,password:z.string().min(10).max(128),name:z.string().trim().min(1).max(60),planId:z.coerce.number().int().positive().optional()});
const loginSchema=z.object({email,password:z.string().min(1).max(128)});
module.exports={email,registerSchema,loginSchema};

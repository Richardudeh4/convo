import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
   if(req.method === "OPTIONS"){
    return new Response("ok", {headers: corsHeaders})
   }
   try{
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    if(!authHeader){
        return new Response(JSON.stringify({error: "Unauthorized"}), 
        {status: 401, headers: {...corsHeaders, "Content-Type": "application/json"}})
    }
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: {headers: {Authorization: authHeader}}
    });
    const {data: {user}, error: userError} = await userClient.auth.getUser();
    if(userError || !user){
        return new Response(JSON.stringify({error: "Unauthorized"}), 
        {status: 401, headers: {...corsHeaders, "Content-Type": "application/json"}})
    }
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const expiredAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { error: updateError } = await adminClient.from("profiles").upsert({
        id: user.id,
        is_premium: true,
        premium_expires_at: expiredAt,
        updated_at: new Date().toISOString(),
    });
    if(updateError) throw updateError;

    return new Response(JSON.stringify({ok: true, premium_expires_at: expiredAt}), {
        headers: {...corsHeaders, "Content-Type": "application/json"}
    });
    // const {data: {subscription}, error: subscriptionError} = await userClient.from("subscriptions").select("*").eq("user_id", user.id).single();
    // if(subscriptionError || !subscription){
    //     return new Response(JSON.stringify({error: "Subscription not found"}), 
    //     {status: 404, headers: {...corsHeaders, "Content-Type": "application/json"}})
    // }
   }
   catch(error:any){
const message = error instanceof Error ? error.message : "An unknown error occurred";
return new Response(JSON.stringify({error: message}), {
    status: 500,
    headers: {...corsHeaders, "Content-Type": "application/json"},
});
   }
 
})
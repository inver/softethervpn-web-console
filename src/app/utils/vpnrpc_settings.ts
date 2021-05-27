// Import the vpnrpc.ts RPC stub.
import * as VPN from "vpnrpc/dist/vpnrpc";

// Output JSON-RPC request / reply strings to the debug console.
VPN.VpnServerRpc.SetDebugMode(process.env.NODE_ENV == 'development');

export let api: VPN.VpnServerRpc;

let user = ""
let password = "PASSWORD_HERE"

// Creating the VpnServerRpc class instance here.
if (process.env.NODE_ENV !== 'development') // // Determine if this JavaScript environment is on production or not
{
    // On the web browser. We do not need to specify any hostname, port or credential as the web browser already knows it.
    api = new VPN.VpnServerRpc();
}
else
{
    // On the Node.js. We need to specify the target VPN Server's hostname, port and credentials.
    api = new VPN.VpnServerRpc("127.0.0.1", 443, user, password, false);
}

/** API test for 'Test', test RPC function */
export async function Test_Test(): Promise<void>
{
    console.log("Begin: Test_Test");
    let a: VPN.VpnRpcTest = new VPN.VpnRpcTest(
        {
            IntValue_u32: 12345,
        });
    let b: VPN.VpnRpcTest = await api.Test(a);
    console.log(b);
    console.log("End: Test_Test");
    console.log("-----");
    console.log();
}

// export async function isAdmin()
// {
//   try{
//     let request = await api.GetConfig()
//     alert('admin');
//     return true;
//   }
//   catch(error){
//     alert(error);
//     return false;
//   }
// }


// isAdmin().then(response => {
//   console.log(response)
// });

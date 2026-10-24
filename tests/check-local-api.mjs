const origin='http://127.0.0.1:5173';
for(const [path,options,expected] of [
 ['/api/ai/status',{},401],
 ['/api/ai/status',{headers:{cookie:'__sites_local_auth=1'}},200],
 ['/api/ai/edit',{method:'POST',headers:{cookie:'__sites_local_auth=1',origin}},503],
 ['/api/ai/edit',{method:'POST',headers:{cookie:'__sites_local_auth=1',origin:'https://other.example'}},403]
]){const res=await fetch(origin+path,options);if(res.status!==expected)throw new Error(`${path}: expected ${expected}, got ${res.status}: ${await res.text()}`);console.log(`${options.method||'GET'} ${path}: ${res.status}`,await res.text());}


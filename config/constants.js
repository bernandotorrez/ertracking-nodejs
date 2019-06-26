if(process.env.NODE_ENV.trim()=='development'){
    var url_ws = 'http://172.16.1.225:5222/ws/com.baf.ws:ws_DataERPR?WSDL',
    url_ws_employee = 'http://172.16.1.225:5222/ws/com.baf.ws.inbound:DataEmployee?WSDL',
    //url_feedback = 'http://172.16.1.225:5222/ws/com.baf.eya.ws.inbound:WSFEEDBACK?WSDL',
    url_feedback = 'http://hqsoaapp87.bussan.co.id:8777/ws/com.baf.eya.ws.inbound:WSFEEDBACK?WSDL',
    url_enhance = 'http://172.16.1.225:5222/ws/com.baf.eya.ws.inbound:WSENCHEYA?WSDL',
    url_eya = 'http://172.16.1.225:5222/ws/com.baf.eya.ws.inbound:WSEYA?WSDL',
    url_dep = 'http://172.16.1.225:5222/ws/com.baf.ws.inbound:DataEmployee?WSDL'; 
    
} else {
    var url_ws = 'http://hqsoaappnew1.bussan.co.id:8777/ws/com.baf.ws:ws_DataERPR?WSDL',
    url_ws_employee = 'http://172.16.1.225:5222/ws/com.baf.ws.inbound:DataEmployee?WSDL',
    //url_feedback = 'http://172.16.1.225:5222/ws/com.baf.eya.ws.inbound:WSFEEDBACK?WSDL',
    url_feedback = 'http://hqsoaapp87.bussan.co.id:8777/ws/com.baf.eya.ws.inbound:WSFEEDBACK?WSDL',
    url_enhance = 'http://172.16.1.225:5222/ws/com.baf.eya.ws.inbound:WSENCHEYA?WSDL',
    url_eya = 'http://172.16.1.225:5222/ws/com.baf.eya.ws.inbound:WSEYA?WSDL',
    url_dep = 'http://172.16.1.225:5222/ws/com.baf.ws.inbound:DataEmployee?WSDL'; 
    

}

var constants = {
    title: 'ER-TRACKING',
    url_ws: url_ws,
    url_ws_employee: url_ws_employee,
    url_feedback: url_feedback,
    url_enhance: url_enhance,
    url_eya: url_eya,
    url_dep: url_dep
}

module.exports = constants
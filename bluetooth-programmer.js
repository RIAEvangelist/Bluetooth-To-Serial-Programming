var serialPort = require("serialport");
var SerialPort = serialPort.SerialPort;
var config={
    baud:9600,
    delay:950
}

var availableBTPorts={};

var portData={
    ports       : [],
    testingPort : 0,
    testingBaud : 0,
    testDuration: 750,
    forcedBaud  : false,
    testBauds   : [
        1200,
        2400,
        4800,
        9600,
        19200,
        38400,
        57600,
        115200
    ]
}

var testTimeout=false;

var BTUSB=false;
var onFound=false;

function connectToBTDevice(port, onOpen){
    if(!port)
        return false;
    if(!port.comName)
        return false;
    
    if(!port.baud)
        port.baud=9600;
    
    var BTConnection=new SerialPort(
        port.comName,
        {
            baudrate: port.baud,
            parser  : serialPort.parsers.readline("OK")
        }
    );

    function BTCommand(data){
        BTConnection._BTCommands.push(data);
        if(BTConnection._BTCommands.length<2)
            BTConnection.write(data);
        
        if(BTConnection.commandTimer)
            return;
        
        BTConnection.commandTimer=true;
        (
            function(BTConnection){
                setTimeout(
                    function(){
                        runCommand.apply(BTConnection);
                    },
                    config.delay
                );
            }
        )(BTConnection);
    }

    BTConnection.BTPin=setBTPin;
    BTConnection.BTBaud=setBTBaud;
    BTConnection.BTName=setBTName;
    BTConnection.BTParity=setBTParity;
    BTConnection.BTTest=BTTest;
    BTConnection.BTVersion=getBTVersion;
    
    BTConnection.BTCommand=BTCommand;
    BTConnection._BTCommands=[];
    BTConnection.runCommand=runCommand;
    
    if(!onOpen)
        return BTConnection;
    
    BTConnection.on(
        "open",
        onOpen
    );

    return BTConnection;
}

function runCommand(){
    this._BTCommands.shift();
    if(this._BTCommands.length<1){
        this.commandTimer=true;
        return;
    }
    
    //console.log(this._BTCommands[0])
    this.write(this._BTCommands[0]);
    (
        function(BTConnection){
            setTimeout(
                function(){
                    runCommand.apply(BTConnection);
                },
                config.delay
            );
        }
    )(this);
}

function setBTPin(pin){
    this.BTCommand("AT+PIN"+pin);
}

function setBTBaud(baud){
    baud=Number(baud);
    
    switch(baud){
        case 1 :
        case 2 :
        case 3 :
        case 4 :
        case 5 :
        case 6 :
        case 7 :
        case 8 :
            //use as native value
            break;
        case 1200 :
            baud=1;
            break;
        case 2400 :
            baud=2;
            break;
        case 4800 :
            baud=3;
            break;
        case 9600 :
            baud=4;
            break;
        case 19200 :
            baud=5;
            break;
        case 38400 :
            baud=6;
            break;
        case 57600 :
            baud=7;
            break;
        case 115200 :
            baud=8;
            break;
        default :
            return;
    }
    
    this.BTCommand("AT+BAUD"+baud);
}

function setBTName(name){
    this.BTCommand("AT+NAME"+name);
}

function setBTParity(parity){
    parity=parity.toLowerCase();
    
    switch(parity){
        case 'none' :
            parity='N';
            break;
        case 'even' :
            parity='E';
            break;
        case 'odd' :
            parity='O';
            break;
        default :
            return;
    }
    
    this.BTCommand("AT+P"+parity);
}

function BTTest(){
    this.BTCommand("AT");
}

function getBTVersion(){
    this.BTCommand("AT+VERSION");
}

function findBTDevices(callback, baud){
    closeBTUSB();

    onFound=callback;
    
    availableBTPorts={};
    
    portData.forcedBaud=baud;
    portData.ports=[];
    portData.testingPort=0;
    portData.testingBaud=-1;

    clearTimeout(testTimeout);

    serialPort.list(
        function (err, ports) {
            //console.log(ports); //this is only logging the single most recently connected serial port.
            portData.ports=ports;
            detectBTDevices();
        }
    );
}

function detectBTDevices(){
    closeBTUSB();
    portData.testingBaud++;

    if(portData.testingBaud>=portData.testBauds.length || (portData.testingBaud>0 && portData.forcedBaud)){
        portData.testingBaud=0;
        portData.testingPort++;
    }

    if(portData.testingPort>=portData.ports.length){
        clearTimeout(testTimeout);
        portData.testingPort=-1;
        if(!onFound)
            return;
        
        onFound(availableBTPorts);
        return;
    }
    
    var baud=(
        (portData.forcedBaud)? 
            portData.forcedBaud
                :
            portData.testBauds[
                portData.testingBaud
            ]
    );

    /*
    console.log(
        portData.ports[
            portData.testingPort
        ].comName,
        baud
    );
    */
   
    BTUSB = new SerialPort(
        portData.ports[
            portData.testingPort
        ].comName,
        {
            baudrate: baud,
            parser  : serialPort.parsers.readline("OK")
        }
    );

    BTUSB.on(
        'open',
        function(){
            testTimeout=setTimeout(
                detectBTDevices,
                portData.testDuration
            );
        
            BTUSB.on(
                "data",
                function (data) {
                    closeBTUSB();
                    //console.log('#',data)
                    var BTDevice=portData.ports[
                        portData.testingPort
                    ];

                    //console.log(portData.testingPort,BTDevice.comName);
                    
                    var baud=(
                        (portData.forcedBaud)? 
                            portData.forcedBaud
                                :
                            portData.testBauds[
                                portData.testingBaud
                            ]
                    );
                    
                    BTDevice.baud=baud;
                    
                    availableBTPorts[
                        BTDevice.comName
                    ]=BTDevice;

                    clearTimeout(testTimeout);
                    portData.testingBaud=-1;
                    portData.testingPort++;
                    detectBTDevices();
                }
            );

            BTUSB.write("AT");
        }
    );
}

function closeBTUSB(){
    try{
        BTUSB.close();
    }catch(err){
        //can't close something that doesn't exist so do nothing
    }
}

module.exports={
    data:{
        config:config,
        testData:portData,
        availableBTPorts:availableBTPorts
    },
    find    : findBTDevices,
    connect : connectToBTDevice
}
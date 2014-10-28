var serialPort = require("serialport");
var SerialPort = serialPort.SerialPort;
var config={
    baud:9600
}

var availableBTPorts={};

var portData={
    ports       : [],
    testingPort : 0,
    testingBaud : 0,
    testDuration: 750,
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

function findBTDevices(baud){
    if(!baud)
        baud=config.baud;

    closeBTUSB();

    portData.baud=baud;

    availableBTPorts={};

    portData.ports=[];
    portData.testingPort=0;
    portData.testingBaud=-1;

    clearTimeout(testTimeout);

    serialPort.list(
        function (err, ports) {
            console.log(ports); //this is only logging the single most recently connected serial port.
            portData.ports=ports;
            detectBTDevices();
        }
    );
}

function detectBTDevices(){
    closeBTUSB();
    portData.testingBaud++;

    if(portData.testingBaud>=portData.testBauds.length){
        portData.testingBaud=0;
        portData.testingPort++;
    }

    if(portData.testingPort>=portData.ports.length){
        clearTimeout(testTimeout);
        portData.testingPort=-1;
        console.log(availableBTPorts);
        return;
    }

    console.log(
        portData.ports[
            portData.testingPort
        ].comName,
        portData.testBauds[
            portData.testingBaud
        ]
    );

    BTUSB = new SerialPort(
        portData.ports[
            portData.testingPort
        ].comName,
        {
            baudrate: portData.testBauds[
                portData.testingBaud
            ],
            parser  : serialPort.parsers.readline("OK")
        },
        function () {
            BTUSB.on(
                "data",
                function (data) {
                    closeBTUSB();
                    console.log('#',data)
                    var BTDevice=portData.ports[
                        portData.testingPort
                    ];

                    console.log(portData.testingPort,BTDevice.comName);

                    availableBTPorts[
                        BTDevice.comName
                    ]={
                        port:BTDevice,
                        baud:portData.testBauds[
                            portData.testingBaud
                        ]
                    };

                    clearTimeout(testTimeout);
                    portData.testingBaud=-1;
                    portData.testingPort++;
                    detectBTDevices();
                }
            );

            testTimeout=setTimeout(
                detectBTDevices,
                portData.testDuration
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

findBTDevices(38400);

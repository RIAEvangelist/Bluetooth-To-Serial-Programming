Bluetooth To Serial Hookup And Programming
=========================================

Diagrams and documents on hooking up bluetooth and serial boards to create a bluetooth to serial connection.

Hardware schematic
====
This is how to hook up the Bluetooth board to the serial board.

[![Bluetooth to Serial Schematic](https://raw.githubusercontent.com/RIAEvangelist/Bluetooth-To-Serial-Hookup-and-Programmin/master/Bluetooth-to-serial-schematic.png)](https://raw.githubusercontent.com/RIAEvangelist/Bluetooth-To-Serial-Hookup-and-Programmin/master/Bluetooth-to-serial-schematic.png)

***Note that the TX and RX cables cross. TX->RX & RX->TX***

Connecting and programming the bluetooth board via node
====
`sudo npm install bluetooth-programmer`

You will most likely need to run your app with root  privileges in order to program the Bluetooth module.

`sudo node yourProgram`

For the most part to program one module at a time, you can use the example app and modify the settings you would like. You can also tweak it just a bit to program many modules.

### Finding bluetooth modules connected via USB or serial

|param|required|
|-----|--------|
|callback when all USB/Serial ports scanned|true|
|baud rate (if not specified all valid bauds will be checked)|false|

You can search all detected USB or Serial ports on all baud rates using the below command. This comes in handy when you have a module which you don't know the baud rate of.

    BTP.find(
        foundDevices
    );

    function foundDevices(devices){
        console.log(devices);
    }

For a faster scan if you know the baud rate of the device you can specify it so the app does not need to itterate over all of the common baud rates.

    BTP.find(
        foundDevices,
        9600
    );

    function foundDevices(devices){
        console.log(devices);
    }

### Connecting to the bluetooth module

you can manually connect to a Bluetooth module by passing in the port info

    {
        comName : '/tty/USB0' //COM1 etc
        baud    : 9600
    }

this information and more is provided for you when you use the `BT.find` method.

    function foundDevices(devices){
        console.log(devices);
    }

Connecting using the `BT.find` results :

    function foundDevices(devices){
        var list=Object.keys(devices);
        BTDevices=devices;
        console.log('Found BT Devices :\n####>',devices);

        if(!list[0])
            return;

        BTP.connect(devices[list[0]],connectedToBT);
    }

Connecting Manually :


    var BTP=require('bluetooth-programmer');
    BTP.connect(
        {
            comName : '/tty/USB0' //COM1 etc
            baud    : 9600
        },
        connectedToBT
    );

you can also assign the port to a variable.

    var myBTModule=BTP.connect(devices[list[0]],connectedToBT);


Things to do once connected.

|event|when it happens|trigger|
|-----|---------------|-------|
|open|when the serial socket to the bluetooth module is opened|this.open() myBTModule.open() (rarely used as this should be automatic)|
|close|when the serial socket to the bluetooth module has been closed|this.close() myBTModule.close()|
|error|when something goes wrong with the serial socket|false|

    function connectedToBT(){
        this.on(
            "data",
            function(data){
                console.log(data);
            }
        );
        
        this.on(
            "close",
            function(){
                console.log('closed');
            }
        );

        this.on(
            "error",
            function(err){
                console.log('error',err);
            }
        );
    }

### Simple commands you can use to program to the Bluetooth module 

|Command|Details|Settable|Response|
|-------|------|--------|--------|
|BTTest|Tests Raw Connection you may also want to use this to check for a return from your last command|false|null or the last message from a command|
|BTName|Sets Bluetooth Device name. 20 Chars max.|true|setname|
|BTBaud|1 or 1200, 2 or 2400, 3 or 4800, 4 or 9600, 5 or 19200, 6 or 38400, 7 or 57600, 8 or 115200|true|{BaudRate} i.e. 9600|
|BTVersion|Returns the firmware version|false|linvor1.8 or something similar|
|BTPin|Sets a new pairing code, 4 digits|true|setPIN|
|BTParity|Set board parity. You probably don't need to do this. None (no parity), Odd (odd parity) or Even (even parity)|true| {None|Odd|Even}|

    this.BTName('DNZ38400');
    
    this.BTPin('1314');
    
    this.BTParity('None');
    
    this.BTBaud(38400);
    
    this.BTTest();

OR

    myBTModule.BTName('DNZ38400');
    
    myBTModule.BTPin('1314');
    
    myBTModule.BTParity('None');
    
    myBTModule.BTBaud(38400);
    
    myBTModule.BTTest();

***It is always a good idea to end with a BTTest() call to see the last response returned.***


Connecting and programming the bluetooth board manually
====

1. Open a serial terminal such as `CuteCom` or `CoolTerm` depending on your operating system.
2. Choose the USB port your bluetooth to serial is connected to. Likely `/dev/USB0` on linux, unix, and Mac ***OR*** `Com0` on windows, though this could be different depending on what you have connected to your computer.
3. Set the baudrate to ***9600***.
4. set the `line ending` to ***none or no line end*** this is normally defaulted to CRLF or something similar.
5. Connect to your board

Programming the board
====

1. send `AT` this should return `OK`, if it does not you are not properly connected to your board. Check the hardware connections, and the serial terminal settings. is your line ending set to `no line ending`? Are you connected to the right port? Perhaps your board starts with a different baud rate?
2. send `AT+VERSION` this should return the firmware version on your bluetooth board. Perhaps something similar to ` linvorV1.8 ` if you want to know specific commands for your version you can always google the returned version number to learn more. If nothing returns try sending `AT VERSION?` and `AT VERSION`

#Some common commands
|Command|Details|Settable|Response|
|-------|------|--------|--------|
|AT|Tests Raw Connection|false|OK|
|AT+NAME{name}|Sets Bluetooth Device name. 20 Chars max.|true|OKsetname|
|AT+BAUD{baudID}|1=1200, 2=2400, 3=4800, 4=9600, 5=19200, 6=38400, 7=57600, 8=115200|true|OK{BaudRate} i.e. OK9600|
|AT+VERSION|Returns the firmware version|false|linvor1.8 or something similar|
|AT+PIN{pin}|Sets a new pairing code, 4 digits|true|OKsetPIN|
|AT+P{N|O|E}|Set board parity. You probably don't need to do this. N (no parity), O (odd parity) or E (even parity)|true|OK {None|Odd|Even}|



Bluetooth To Serial Hookup And Programming
=========================================

Diagrams and documents on hooking up bluetooth and serial boards to create a bluetooth to serial connection.

Hardware schematic
====
This is how to hook up the Bluetooth board to the serial board.

[![Bluetooth to Serial Schematic](https://raw.githubusercontent.com/RIAEvangelist/Bluetooth-To-Serial-Hookup-and-Programmin/master/Bluetooth-to-serial-schematic.png)](https://raw.githubusercontent.com/RIAEvangelist/Bluetooth-To-Serial-Hookup-and-Programmin/master/Bluetooth-to-serial-schematic.png)

***Note that the TX and RX cables cross. TX->RX & RX->TX***

Connecting the bluetooth board manually
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
|Command|Action|Settable|Response|
|-------|------|--------|--------|
|AT|Tests Raw Connection|false|OK|
|AT+NAME{name}|Sets Bluetooth Device name. 20 Chars max.|true|OKsetname|
|AT+BAUD{baudID}|1=1200, 2=2400, 3=4800, 4=9600, 5=19200, 6=38400, 7=57600, 8=115200|true|OK{BaudRate} i.e. OK9600|
|AT+VERSION|Returns the firmware version|false|linvor1.8 or something similar|
|AT+PIN{pin}|Sets a new pairing code, 4 digits|true|OKsetPIN|
|AT+P{N|O|E}|Set board parity. You probably don't need to do this. N (no parity), O (odd parity) or E (even parity)|true|OK {None|Odd|Even}|



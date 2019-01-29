#include "MicroBit.h"

MicroBit uBit;

void onBleConnected(MicroBitEvent)
{
    uBit.display.print("C");
}

void onBleDisconnected(MicroBitEvent)
{
    uBit.display.print("D");
}

int main()
{
    uBit.init();

    new MicroBitButtonService(*uBit.ble);
    new MicroBitLEDService(*uBit.ble, uBit.display);

    uBit.messageBus.listen(MICROBIT_ID_BLE, MICROBIT_BLE_EVT_CONNECTED, onBleConnected);
    uBit.messageBus.listen(MICROBIT_ID_BLE, MICROBIT_BLE_EVT_DISCONNECTED, onBleDisconnected);

    release_fiber();
}

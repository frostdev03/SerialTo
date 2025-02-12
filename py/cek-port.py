import serial
try:
    ser = serial.Serial('COM8', 115200, timeout=1)
    print("Berhasil membuka COM8")
    ser.close()
except serial.SerialException as e:
    print(f"Error: {e}")

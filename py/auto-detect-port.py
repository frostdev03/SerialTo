import serial.tools.list_ports

def find_stm32_port():
    while True:
        ports = serial.tools.list_ports.comports()
        for port in ports:
            if "STM" in port.description or "STMicroelectronics" or "Microsoft" in (port.manufacturer or ""):
                return port.device  
        print("STM32 tidak ditemukan. Coba colokkan kembali...")
        
stm32_port = find_stm32_port()
print(f"STM32 terdeteksi di port: {stm32_port}")

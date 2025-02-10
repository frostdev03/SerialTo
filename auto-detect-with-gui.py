import serial
import serial.tools.list_ports
import tkinter as tk

def get_stm():
    ports = serial.tools.list_ports.comports()
    for port in ports:
        if "STM" in port.description or "STMicoelectronics" or "Microsoft" or "Baruno" or "Baruni" in (port.manufacturer or ""):
            return port.device
        return None

def stm_detected():
    global ser
    stm32_port = get_stm()
    if stm32_port:
        port_label.config(text=f"STM32 terdeteksi di port: {stm32_port}", fg="green")
        try:
            if ser is None or not ser.is_open:
                ser = serial.Serial(stm32_port, 115200, timeout=1)
        except Exception as e:
            print(f"Error membuka port: {e}")
    else:
        port_label.config(text="STM32 tidak ditemukan", fg="red")
    root.after(100, stm_detected)  # delay deteksi

def read_serial_data():
    if ser and ser.in_waiting > 0:
        try:
            data = ser.readline().decode('utf-8').strip()  # read
            t_output.insert(tk.END, data + "\n")  # show
            t_output.see(tk.END)  # always show latest data
        except Exception as e:
            print(f"Kesalahan membaca data serial: {e}")
    root.after(100, read_serial_data)  # delay pembacaan
    
def send_to_stm():
    if ser and ser.is_open:
        text = t_input.get("1.0", tk.END).strip()
        if text:
            try:
                ser.write(f"{text}\n".encode())
                t_input.delete("1.0", tk.END)
            except Exception as e:
                print(f"Error mengirim data: {e}") 

# GUI
root = tk.Tk()
root.title("STM32L443")
root.geometry("500x300")

title = tk.Label(root, text="Deteksi STM32", font=("Arial", 14, "bold"))
title.pack(pady=10)

port_label = tk.Label(root, text="Mendeteksi port...", font=("Arial", 12))
port_label.pack()

t_input = tk.Text(root, height=5, width=20)
t_input.pack(pady=10)

send_btn = tk.Button(root, text="Kirim", command=send_to_stm)
send_btn.pack(pady=10)

t_output = tk.Text(root, height=5, width=20)
t_output.pack(pady=10)

ser = None 
stm_detected()
read_serial_data()

root.mainloop()
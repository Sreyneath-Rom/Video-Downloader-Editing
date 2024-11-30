import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import yt_dlp
import cv2
import os
from pydub import AudioSegment
# Initialize the main window
gui_root = tk.Tk()
gui_root.title("Media Tools Pro")
gui_root.geometry("1000x400")
gui_root.resizable(1, 2)
gui_root.config(bg="black")

active_frame = "youtube"
current_language = "English"

# Variables to store the directory paths and other necessary values
download_dir = tk.StringVar()
download_dir_fb = tk.StringVar()
audio_save_dir = tk.StringVar()
download_dir_yt = tk.StringVar()
video_url = tk.StringVar()
fb_url = tk.StringVar()
video_path = tk.StringVar()
timestamp_entry = tk.StringVar()
audio_path = tk.StringVar()
start_time_entry = tk.StringVar()
end_time_entry = tk.StringVar()

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
# Function to toggle the language
def switch_language():
    global current_language
    if current_language == "English":
        current_language = "ខ្មែរ"
        # frame
        youtube_frame.config(text=" ទាញយកវីដេអូ YouTube ")
        facebook_frame.config(text="ទាញយកវីដេអូ Facebook")
        video_frame_extractor_frame.config(text=" ទាញយករូបភាព ")
        audio_cutter_frame.config(text=" កាត់សំឡេង ")
        download_audio_frame.config(text=" ទាញយកសំឡេង ")
        playlist_frame.config(text=" បញ្ជី YouTube ")
        # btn
        youtube_button.config(text="ទាញយកវីដេអូ YouTube")
        facebook_button.config(text="ទាញយកវីដេអូ Facebook")
        video_frame_extractor_button.config(text="ទាញយករូបភាព")
        audio_cutter_button.config(text="កាត់សំឡេង")
        download_audio_button.config(text="ទាញយកសំឡេង")
        playlist_youtube_button.config(text="បញ្ជី YouTube")
        # lable
        url_label.config (text="វីដេអូ URL:")
        des_label.config(text="ទីតាំងរក្សាទុក:")
        fb_url_label.config(text="វីដេអូ URL:")
        fb_des_label.config(text="ទីតាំងរក្សាទុក:")
        playlist_label .config(text="វីដេអូ URL:")
        playlist_des_label .config(text="ទីតាំងរក្សាទុក:")
        video_label .config (text="ទីតាំងរក្សាទុក:")
        timestamp_label .config (text="ពេលវេលានាទី(ម៉ោង:នាទី:វីនាទី):")
        audio_file_label.config(text="ឯកសារសំឡេង:")
        start_time_label.config(text="ចាប់ផ្ដើម(ម៉ោង:នាទី:វីនាទី):")
        end_time_label.config(text="បញ្ចប់(ម៉ោង:នាទី:វីនាទី):")
        save_dir_label.config(text="រក្សារទុក:")
        progress_bar_label.config(text="ដំណើរការទាញយក:")
        #btn lable
        browse_button.config(text="ទីតាំង")
        download_button.config(text="ទាញយក")
        close_button.config( text="ចាកចេញ")
        browse_button_fb.config(text="ទីតាំង")
        download_button_fb.config(text="ទាញយក")
        close_button_fb.config(text="ចាកចេញ")
        browse_button_playlist.config( text="ទីតាំង")
        download_button_playlist.config (text="ទាញយក")
        close_button_playlist.config( text="ចាកចេញ")
        browse_video_button.config( text="ទីតាំង វីដេអូ")
        extract_image_button.config( text="ទាញយក​ រូបភាព") 
        close_image_button.config( text="ចាកចេញ")
        browse_audio_button.config( text="ទីតាំងឯកសារ")
        browse_save_dir_button.config( text="ទីតាំង​រក្សារទុក")
        cut_audio_button.config( text="កាត់សំឡេង")
        close_audio_button.config( text="ចាកចេញ")
        audio_browse_button.config(text="ទីតាំង")
        audio_download_button.config(text="ទាញយកសំឡេង")
        close_audio_download_button.config(text="ចាកចេញ")
        switch_language_button.config(text="English")
    else:
        current_language = "English"
        youtube_frame.config(text=" YouTube Downloader ")
        facebook_frame.config(text=" Facebook Downloader ")
        video_frame_extractor_frame.config(text=" Video Frame Extractor ")
        audio_cutter_frame.config(text=" Audio Cutter ")
        download_audio_frame.config(text=" Audio Downloader ")
        playlist_frame.config(text=" Playlist Downloader ")
        # btn
        youtube_button.config(text="YouTube Downloader")
        facebook_button.config(text="Facebook Downloader")
        video_frame_extractor_button.config(text="Video Frame Extractor")

        audio_cutter_button.config(text="Audio Cutter")
        download_audio_button.config(text="Audio Downloader")
        playlist_youtube_button.config(text="Playlist Downloader")
        # lable
        url_label.config (text="Video URL:")
        des_label.config(text="Destination:")
        fb_url_label.config(text="Video URL:")
        fb_des_label.config(text="Destination:")
        playlist_label .config(text="Video URL:")
        playlist_des_label .config(text="Destination:")
        video_label .config (text="Video Path:")
        timestamp_label .config (text="Timestamp (HH:MM:SS):")
        audio_file_label.config(text="Audio File:")
        start_time_label.config(text="Start Time (HH:MM:SS):")
        end_time_label.config(text="End Time (HH:MM:SS):")
        save_dir_label.config(text="Save Directory:")
        audio_url_label.config(text="YouTube URL:")
        progress_bar_label.config(text="Download Progress:")
        #btn lable
        browse_button.config(text="Browse")
        download_button.config(text="Download")
        close_button.config( text="Exit")
        browse_button_fb.config(text="Browse")
        download_button_fb.config(text="Download")
        close_button_fb.config(text="Exit")
        browse_button_playlist.config( text="Browse")
        download_button_playlist.config (text="Download")
        close_button_playlist.config( text="Exit")
        browse_video_button.config( text="Browse Video")
        extract_image_button.config( text="Extract Image") 
        close_image_button.config( text="Exit")
        browse_audio_button.config( text="Browse File")
        browse_save_dir_button.config( text="Browse Save")
        cut_audio_button.config( text="Cut Audio")
        close_audio_button.config( text="Exit")
        audio_browse_button.config(text="Browse")
        audio_download_button.config(text="Download Audio")
        close_audio_download_button.config(text="Exit")
        switch_language_button.config(text="ខ្មែរ")

def browse_directory():
    directory = filedialog.askdirectory()
    if active_frame == "youtube":
        download_dir.set(directory)
    elif active_frame == "facebook":
        download_dir_fb.set(directory)
    elif active_frame == "audio_cutter":
        audio_save_dir.set(directory)
    elif active_frame == "playlist_youtube":
        download_dir_yt.set(directory)

def download_video():
    url = video_url.get()
    if not url:
        messagebox.showerror("Error", "Please enter a YouTube URL")
        return

    ydl_opts = {
        'outtmpl': f"{download_dir.get()}/%(title)s.%(ext)s",
        'format': 'best'
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
            messagebox.showinfo("Success", "YouTube video downloaded successfully!")
    except Exception as e:
        messagebox.showerror("Error", f"Failed to download video: {e}")

def download_audio():
    url = video_url.get()
    if not url:
        messagebox.showerror("Error", "Please enter a YouTube URL")
        return

    download_path = filedialog.askdirectory(title="Select Download Folder")
    if not download_path:
        messagebox.showwarning("Warning", "Please select a folder to save the audio.")
        return

    try:
        ydl_opts = {
            "format": "bestaudio/best",
            "outtmpl": f"{download_path}/%(title)s.%(ext)s",
            "postprocessors": [
                {
                    "key": "FFmpegExtractAudio",
                    "preferredcodec": "mp3",
                    "preferredquality": "192",
                }
            ],
            "progress_hooks": [progress_hook],
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])

        messagebox.showinfo("Success", "Audio downloaded successfully!")
    except Exception as e:
        messagebox.showerror("Error", f"Failed to download audio: {e}")


# Function to handle progress updates for downloads
def progress_hook(d):
    if d["status"] == "downloading":
        total_bytes = d.get("total_bytes", 1)
        downloaded_bytes = d.get("downloaded_bytes", 0)
        progress_percentage = int((downloaded_bytes / total_bytes) * 100)
        progress_bar["value"] = progress_percentage
        gui_root.update()
    elif d["status"] == "finished":
        progress_bar["value"] = 100
        gui_root.update()

# Function to download video from Facebook
def download_facebook_video():
    url = fb_url.get()
    if not url:
        messagebox.showerror("Error", "Please enter a Facebook URL")
        return
    fdl_opts = {
        'outtmpl': f"{download_dir_fb.get()}/%(title)s.%(ext)s",
        'format': 'best'
    }
    
    try:
        with yt_dlp.YoutubeDL(fdl_opts) as ydl:
            ydl.download([url])
            messagebox.showinfo("Success", "Facebook video downloaded successfully!") 
    except Exception as e:
        messagebox.showerror("Error", f"Failed to download video: {e}")

# Function to extract an image from a video
def extract_image():
    file_path = video_path.get()
    timestamp = timestamp_entry.get()
    if not os.path.exists(file_path):
        messagebox.showerror("Error", "Please select a valid video file.")
        return
    try:
        time_ms = convert_to_milliseconds(timestamp)
        cap = cv2.VideoCapture(file_path)
        if not cap.isOpened():
            messagebox.showerror("Error", "Failed to open video file.")
            return
        cap.set(cv2.CAP_PROP_POS_MSEC, time_ms)
        ret, frame = cap.read()
        if ret:
            save_path = filedialog.asksaveasfilename(
                title="Save Image As",
                defaultextension=".png",
                filetypes=[("PNG Files", "*.png"), ("JPEG Files", "*.jpg"), ("All Files", "*.*")]
            )
            if save_path:
                cv2.imwrite(save_path, frame)
                messagebox.showinfo("Success", f"Image saved to {save_path}")
        else:
            messagebox.showerror("Error", "Failed to extract frame at the specified time.")
        cap.release()
    except Exception as e:
        messagebox.showerror("Error", f"An error occurred: {str(e)}")

# Function to convert time to milliseconds
def convert_to_milliseconds(time_str):
    parts = time_str.split(":")
    if len(parts) == 2:
        minutes, seconds = map(int, parts)
        return (minutes * 60 + seconds) * 1000
    elif len(parts) == 3:
        hours, minutes, seconds = map(int, parts)
        return (hours * 3600 + minutes * 60 + seconds) * 1000
    else:
        raise ValueError("Invalid time format. Use HH:MM:SS or MM:SS.")

# Function to select an audio file
def select_audio_file():
    file_path = filedialog.askopenfilename(
        title="Select Audio File",
        filetypes=[("Audio Files", "*.mp3 *.wav *.ogg *.flac"), ("All Files", "*.*")]
    )
    if file_path:
        audio_path.set(file_path)


# Function to cut the selected audio file based on start and end times
def cut_audio():
    file_path = audio_path.get()
    start_time = start_time_entry.get()
    end_time = end_time_entry.get()
    if not os.path.exists(file_path):
        messagebox.showerror("Error", "Please select a valid audio file.")
        return
    try:
        start_ms = convert_to_milliseconds(start_time)
        end_ms = convert_to_milliseconds(end_time)
        if start_ms >= end_ms:
            messagebox.showerror("Error", "Start time must be less than end time.")
            return
        audio = AudioSegment.from_file(file_path)
        if start_ms > len(audio) or end_ms > len(audio):
            messagebox.showerror("Error", "Selected times are outside the audio duration.")
            return
        cut_audio = audio[start_ms:end_ms]
        save_path = filedialog.asksaveasfilename(
            title="Save Cut Audio As",
            defaultextension=".mp3",
            filetypes=[("MP3 Files", "*.mp3"), ("WAV Files", "*.wav"), ("All Files", "*.*")]
        )
        if save_path:
            cut_audio.export(save_path, format=os.path.splitext(save_path)[1][1:])
            messagebox.showinfo("Success", f"Audio saved to {save_path}")
            status_label.config(text="Audio successfully cut and saved!", foreground="green")
    except Exception as e:
        messagebox.showerror("Error", f"An error occurred: {str(e)}")

# Function to switch to Audio YouTube downloader
def switch_to_audio_YouTube():
    global active_frame
    active_frame = "audio_download"
    download_audio_frame.tkraise()

# Function to switch to YouTube downloader
def switch_to_youtube():
    global active_frame
    active_frame = "youtube"
    youtube_frame.tkraise()

# Function to switch to YouTube playlist downloader
def switch_to_playlist_youtube():
    global active_frame
    active_frame = "playlist_youtube"
    playlist_frame.tkraise()

# Function to switch to Facebook downloader
def switch_to_facebook():
    global active_frame
    active_frame = "facebook"
    facebook_frame.tkraise()

# Function to switch to Video Frame Extractor
def switch_to_video_frame_extractor():
    global active_frame
    active_frame = "video_frame_extractor"
    video_frame_extractor_frame.tkraise()

# Function to switch to Audio Cutter
def switch_to_audio_cutter():
    global active_frame
    active_frame = "audio_cutter"
    audio_cutter_frame.tkraise()

# Function to exit the application
def exit_app():
    if messagebox.askyesno("Confirm Exit", "Are you sure you want to exit?"):
        gui_root.destroy()

# Create main frame container
main_frame = tk.Frame(gui_root, bg="black")
main_frame.grid(row=0,column=1)
button_frame = tk.Frame(gui_root, bg="black")
button_frame.grid(row=0,column=0,pady=30,padx=20)



youtube_button = tk.Button(button_frame, text="YouTube Downloader",width=20, font=("verdana", 10), bg="#F64247", fg="#FFFFFF", activebackground="#FFE0B7", activeforeground="#000000", relief=tk.GROOVE, command=switch_to_youtube)
facebook_button = tk.Button(button_frame, text="Facebook Downloader",width=20, font=("verdana", 10), bg="#3b5998", fg="#FFFFFF", activebackground="#8b9dc3", activeforeground="#000000", relief=tk.GROOVE, command=switch_to_facebook)
video_frame_extractor_button = tk.Button(button_frame, text="Video Frame Extractor",width=20, font=("verdana", 10), bg="#1E90FF", fg="#FFFFFF", activebackground="#87CEFA", activeforeground="#000000", relief=tk.GROOVE, command=switch_to_video_frame_extractor)
audio_cutter_button = tk.Button(button_frame, text="Audio Cutter", font=("verdana", 10),width=20, bg="#28a745", fg="#FFFFFF", activebackground="#8bc34a", activeforeground="#000000", relief=tk.GROOVE, command=switch_to_audio_cutter)
download_audio_button = tk.Button(button_frame, text="Audio Downloader", font=("verdana", 10),width=20, bg="#003", fg="#FFFFFF", activebackground="#8bc34a", activeforeground="#000000", relief=tk.GROOVE, command=switch_to_audio_YouTube)
playlist_youtube_button = tk.Button(button_frame, text="Playlist Downloader", font=("verdana", 10),width=20, bg="#003", fg="#FFFFFF", activebackground="#8bc34a", activeforeground="#000000", relief=tk.GROOVE, command=switch_to_playlist_youtube)
switch_language_button = tk.Button(button_frame, text="Khmer", font=("verdana", 10),width=20, bg="#8B0000", fg="#FFFFFF", activebackground="#ff6347", activeforeground="#000000", relief=tk.GROOVE, command=switch_language)

youtube_button.pack(side=tk.TOP, padx=10,pady=10)
facebook_button.pack(side=tk.TOP, padx=10,pady=10)
video_frame_extractor_button.pack(side=tk.TOP, padx=10,pady=10)
audio_cutter_button.pack(side=tk.TOP, padx=10,pady=10)
download_audio_button.pack(side=tk.TOP, padx=10,pady=10)
playlist_youtube_button.pack(side=tk.TOP, padx=10,pady=10)
switch_language_button.pack(side=tk.TOP, padx=10,pady=10)

# Create frames for functionalities
youtube_frame = tk.LabelFrame(main_frame, text=" YouTube ", bg="#E5E4E2")
facebook_frame = tk.LabelFrame(main_frame, text=" Facebook ", bg="#E5E4E2", padx=10, pady=10)
video_frame_extractor_frame = tk.LabelFrame(main_frame, text=" Video Frame Extractor ", bg="#E5E4E2", padx=10, pady=10)
audio_cutter_frame = tk.LabelFrame(main_frame, text=" Audio Cutter ", bg="#E5E4E2", padx=10, pady=10)
download_audio_frame = tk.LabelFrame(main_frame, text=" Audio Downloader ", bg="#E5E4E2", padx=10, pady=10)
playlist_frame = tk.LabelFrame(main_frame, text=" Playlist YouTube ", bg="#E5E4E2", padx=10, pady=10)

for frame in (youtube_frame, facebook_frame, video_frame_extractor_frame, audio_cutter_frame, download_audio_frame, playlist_frame):
    frame.grid(row=0, column=0, sticky='nsew', padx=20, pady=37.5)

# YouTube downloader widgets
url_label = tk.Label(youtube_frame, text="Video URL:", font=("verdana", 10), bg="#E5E4E2", fg="#000000", anchor=tk.W)
des_label = tk.Label(youtube_frame, text="Destination:", font=("verdana", 10), bg="#E5E4E2", fg="#000000", anchor=tk.W)

video_url = tk.StringVar()
download_dir = tk.StringVar()

url_field = tk.Entry(youtube_frame, textvariable=video_url, width=40, font=("verdana", 10), bg="#FFFFFF", fg="#000000", relief=tk.GROOVE)
des_field = tk.Entry(youtube_frame, textvariable=download_dir, width=40, font=("verdana", 10), bg="#FFFFFF", fg="#000000", relief=tk.GROOVE)
browse_button = tk.Button(youtube_frame, text="Browse", width=8, font=("verdana", 10), bg="#FF9200", fg="#FFFFFF", activebackground="#FFE0B7", activeforeground="#000000", relief=tk.GROOVE, command=browse_directory)



download_button = tk.Button(youtube_frame, text="Download", width=18, font=("verdana", 10), bg="#15EF5F", fg="#FFFFFF", activebackground="#97F9B8", activeforeground="#000000", relief=tk.GROOVE, command=download_video)
close_button = tk.Button(youtube_frame, text="Exit", width=18, font=("verdana", 10), bg="#F64247", fg="#FFFFFF", activebackground="#F7A2A5", activeforeground="#000000", relief=tk.GROOVE, command=exit_app)

url_label.grid(row=0, column=0, padx=5, pady=5, sticky=tk.W)
url_field.grid(row=0, column=1, padx=5, pady=5, columnspan=2)
des_label.grid(row=1, column=0, padx=5, pady=5, sticky=tk.W)
des_field.grid(row=1, column=1, padx=5, pady=5, columnspan=2)
browse_button.grid(row=1, column=3, padx=5, pady=5)
download_button.grid(row=2, column=1, padx=5, pady=10)
close_button.grid(row=2, column=2, padx=5, pady=10)

# Facebook downloader widgets
fb_url_label = tk.Label(facebook_frame, text="Video URL:", font=("verdana", 10), bg="#E5E4E2", fg="#000000")
fb_des_label = tk.Label(facebook_frame, text="Destination:", font=("verdana", 10), bg="#E5E4E2", fg="#000000")

fb_url = tk.StringVar()
download_dir_fb = tk.StringVar()

fb_url_field = tk.Entry(facebook_frame, textvariable=fb_url, width=40, font=("verdana", 10), bg="#FFFFFF", fg="#000000", relief=tk.GROOVE)
fb_des_field = tk.Entry(facebook_frame, textvariable=download_dir_fb, width=40, font=("verdana", 10), bg="#FFFFFF", fg="#000000", relief=tk.GROOVE)
browse_button_fb = tk.Button(facebook_frame, text="Browse", width=8, font=("verdana", 10), bg="#FF9200", fg="#FFFFFF", activebackground="#FFE0B7", activeforeground="#000000", relief=tk.GROOVE, command=browse_directory)

download_button_fb = tk.Button(facebook_frame, text="Download", width=18, font=("verdana", 10), bg="#15EF5F", fg="#FFFFFF", activebackground="#97F9B8", activeforeground="#000000", relief=tk.GROOVE, command=download_facebook_video)
close_button_fb = tk.Button(facebook_frame, text="Exit", width=18, font=("verdana", 10), bg="#F64247", fg="#FFFFFF", activebackground="#F7A2A5", activeforeground="#000000", relief=tk.GROOVE, command=exit_app)

fb_url_label.grid(row=0, column=0, padx=5, pady=5, sticky=tk.W)
fb_url_field.grid(row=0, column=1, padx=5, pady=5, columnspan=2)
fb_des_label.grid(row=1, column=0, padx=5, pady=5, sticky=tk.W)
fb_des_field.grid(row=1, column=1, padx=5, pady=5, columnspan=2)
browse_button_fb.grid(row=1, column=3, padx=5, pady=5)
download_button_fb.grid(row=2, column=1, padx=5, pady=10)
close_button_fb.grid(row=2, column=2, padx=5, pady=10)

# Playlist downloader widgets 
playlist_label = tk.Label(playlist_frame, text="Video URL:", font=("verdana", 10), bg="#E5E4E2", fg="#000000", anchor=tk.W)
playlist_des_label = tk.Label(playlist_frame, text="Destination:", font=("verdana", 10), bg="#E5E4E2", fg="#000000", anchor=tk.W)

playlist_url = tk.StringVar()
download_dir_yt = tk.StringVar()

playlist_field = tk.Entry(playlist_frame, textvariable=playlist_url, width=40, font=("verdana", 10), bg="#FFFFFF", fg="#000000", relief=tk.GROOVE)
playlist_des_field = tk.Entry(playlist_frame, textvariable=download_dir_yt, width=40, font=("verdana", 10), bg="#FFFFFF", fg="#000000", relief=tk.GROOVE)
browse_button_playlist = tk.Button(playlist_frame, text="Browse", width=8, font=("verdana", 10), bg="#FE9200", fg="#FFFFFF", activebackground="#FFE0B7", activeforeground="#000000", relief=tk.GROOVE, command=browse_directory)

download_button_playlist = tk.Button(playlist_frame, text="Download", width=18, font=("verdana", 10), bg="#15EF5F", fg="#FFFFFF", activebackground="#97F9B8", activeforeground="#000000", relief=tk.GROOVE, command=download_video)
close_button_playlist = tk.Button(playlist_frame, text="Exit", width=18, font=("verdana", 10), bg="#F64247", fg="#FFFFFF", activebackground="#F7A2A5", activeforeground="#000000", relief=tk.GROOVE, command=exit_app)




playlist_label.grid(row=0, column=0, padx=5, pady=5, sticky=tk.W)
playlist_field.grid(row=0, column=1, padx=5, pady=5, columnspan=2)
playlist_des_label.grid(row=1, column=0, padx=5, pady=5, sticky=tk.W)
playlist_des_field.grid(row=1, column=1, padx=5, pady=5, columnspan=2)
browse_button_playlist.grid(row=1, column=3, padx=5, pady=5)
download_button_playlist.grid(row=2, column=1, padx=5, pady=10)
close_button_playlist.grid(row=2, column=2, padx=5, pady=10)

# Video Frame Extractor widgets
video_label = tk.Label(video_frame_extractor_frame, text="Video Path:", font=("verdana", 10), bg="#E5E4E2", fg="#000000", anchor=tk.W)
timestamp_label = tk.Label(video_frame_extractor_frame, text="Timestamp (HH:MM:SS):", font=("verdana", 10), bg="#E5E4E2", fg="#000000", anchor=tk.W)

video_path = tk.StringVar()
timestamp_entry = tk.StringVar()

video_field = tk.Entry(video_frame_extractor_frame, textvariable=video_path, width=40, font=("verdana", 10), bg="#FFFFFF", fg="#000000", relief=tk.GROOVE)
timestamp_field = tk.Entry(video_frame_extractor_frame, textvariable=timestamp_entry, width=40, font=("verdana", 10), bg="#FFFFFF", fg="#000000", relief=tk.GROOVE)

browse_video_button = tk.Button(video_frame_extractor_frame, text="Browse Video", font=("verdana", 10), bg="#FF9200", fg="#FFFFFF", activebackground="#FFE0B7", activeforeground="#000000", relief=tk.GROOVE, command=lambda: video_path.set(filedialog.askopenfilename(filetypes=[("Video Files", "*.mp4 *.avi *.mkv *.mov"), ("All Files", "*.*")])))
extract_image_button = tk.Button(video_frame_extractor_frame, text="Extract Image", width=18, font=("verdana", 10), bg="#15EF5F", fg="#FFFFFF", activebackground="#97F9B8", activeforeground="#000000", relief=tk.GROOVE, command=extract_image)
close_image_button = tk.Button(video_frame_extractor_frame, text="Exit", width=18, font=("verdana", 10), bg="#F64247", fg="#FFFFFF", activebackground="#F7A2A5", activeforeground="#000000", relief=tk.GROOVE, command=exit_app)

video_label.grid(row=0, column=0, padx=5, pady=5, sticky=tk.W)
video_field.grid(row=0, column=1, padx=5, pady=5, columnspan=2)
browse_video_button.grid(row=0, column=3, padx=5, pady=5)
timestamp_label.grid(row=1, column=0, padx=5, pady=5, sticky=tk.W)
timestamp_field.grid(row=1, column=1, padx=5, pady=5, columnspan=2)
extract_image_button.grid(row=2, column=1, padx=5, pady=10)
close_image_button.grid(row=2, column=2, padx=5, pady=10)

# Audio Cutter widgets
audio_file_label = tk.Label(audio_cutter_frame, text="Audio File:", font=("verdana", 10), bg="#E5E4E2", fg="#000000", anchor=tk.W)
start_time_label = tk.Label(audio_cutter_frame, text="Start Time (HH:MM:SS):", font=("verdana", 10), bg="#E5E4E2", fg="#000000", anchor=tk.W)
end_time_label = tk.Label(audio_cutter_frame, text="End Time (HH:MM:SS):", font=("verdana", 10), bg="#E5E4E2", fg="#000000", anchor=tk.W)
save_dir_label = tk.Label(audio_cutter_frame, text="Save Directory:", font=("verdana", 10), bg="#E5E4E2", fg="#000000", anchor=tk.W)

audio_file_field = tk.Entry(audio_cutter_frame, textvariable=audio_path, width=40, font=("verdana", 10), bg="#FFFFFF", fg="#000000", relief=tk.GROOVE)
start_time_field = tk.Entry(audio_cutter_frame, textvariable=start_time_entry, width=40, font=("verdana", 10), bg="#FFFFFF", fg="#000000", relief=tk.GROOVE)
end_time_field = tk.Entry(audio_cutter_frame, textvariable=end_time_entry, width=40, font=("verdana", 10), bg="#FFFFFF", fg="#000000", relief=tk.GROOVE)
save_dir_field = tk.Entry(audio_cutter_frame, textvariable=audio_save_dir, width=40, font=("verdana", 10), bg="#FFFFFF", fg="#000000", relief=tk.GROOVE)

browse_audio_button = tk.Button(audio_cutter_frame, text="Browse File", font=("verdana", 10), bg="#FF9200", fg="#FFFFFF", activebackground="#FFE0B7", activeforeground="#000000", relief=tk.GROOVE, command=select_audio_file)
browse_save_dir_button = tk.Button(audio_cutter_frame, text="Browse Save", font=("verdana", 10), bg="#FF9200", fg="#FFFFFF", activebackground="#FFE0B7", activeforeground="#000000", relief=tk.GROOVE, command=lambda: audio_save_dir.set(filedialog.askdirectory()))



cut_audio_button = tk.Button(audio_cutter_frame, text="Cut Audio", width=18, font=("verdana", 10), bg="#15EF5F", fg="#FFFFFF", activebackground="#97F9B8", activeforeground="#000000", relief=tk.GROOVE, command=cut_audio)
close_audio_button= tk.Button(audio_cutter_frame, text="Exit", width=18, font=("verdana", 10), bg="#F64247", fg="#FFFFFF", activebackground="#F7A2A5", activeforeground="#000000", relief=tk.GROOVE, command=exit_app)

audio_file_label.grid(row=0, column=0, padx=5, pady=5, sticky=tk.W)
audio_file_field.grid(row=0, column=1, padx=5, pady=5, columnspan=2)
browse_audio_button.grid(row=0, column=3, padx=5, pady=5)

start_time_label.grid(row=1, column=0, padx=5, pady=5, sticky=tk.W)
start_time_field.grid(row=1, column=1, padx=5, pady=5, columnspan=2)
end_time_label.grid(row=2, column=0, padx=5, pady=5, sticky=tk.W)
end_time_field.grid(row=2, column=1, padx=5, pady=5, columnspan=2)

save_dir_label.grid(row=3, column=0, padx=5, pady=5, sticky=tk.W)
save_dir_field.grid(row=3, column=1, padx=5, pady=5, columnspan=2)
browse_save_dir_button.grid(row=3, column=3, padx=5, pady=5)

cut_audio_button.grid(row=4, column=1, padx=5, pady=10)
close_audio_button.grid(row=4, column=2, padx=5, pady=10)

# Status label for audio cutter
status_label = tk.Label(audio_cutter_frame, text="", font=("verdana", 10), bg="#E5E4E2", fg="red", anchor=tk.W)
status_label.grid(row=5, column=0, padx=5, pady=5, columnspan=3)

# YouTube Audio Downloader widgets
audio_url_label = tk.Label(download_audio_frame, text="YouTube URL:", font=("verdana", 10), bg="#E5E4E2", fg="#000000", anchor=tk.W)
audio_url_field = tk.Entry(download_audio_frame, textvariable=video_url, width=40, font=("verdana", 10), bg="#FFFFFF", fg="#000000", relief=tk.GROOVE)
audio_browse_button = tk.Button(download_audio_frame, text="Browse", width=8, font=("verdana", 10), bg="#FF9200", fg="#FFFFFF", activebackground="#FFE0B7", activeforeground="#000000", relief=tk.GROOVE, command=browse_directory)
audio_download_button = tk.Button(download_audio_frame, text="Download Audio", width=18, font=("verdana", 10), bg="#15EF5F", fg="#FFFFFF", activebackground="#97F9B8", activeforeground="#000000", relief=tk.GROOVE, command=download_audio)
close_audio_download_button = tk.Button(download_audio_frame, text="Exit", width=18, font=("verdana", 10), bg="#F64247", fg="#FFFFFF", activebackground="#F7A2A5", activeforeground="#000000", relief=tk.GROOVE, command=exit_app)

audio_url_label.grid(row=0, column=0, padx=5, pady=5, sticky=tk.W)
audio_url_field.grid(row=0, column=1, padx=5, pady=5, columnspan=2)
audio_browse_button.grid(row=0, column=3, padx=5, pady=5)
audio_download_button.grid(row=1, column=1, padx=5, pady=10)
close_audio_download_button.grid(row=1, column=2, padx=5, pady=10)


# Progress bar for audio download
progress_bar_label = tk.Label(download_audio_frame, text="Download Progress:", font=("verdana", 10), bg="#E5E4E2", fg="#000000", anchor=tk.W)
progress_bar = ttk.Progressbar(download_audio_frame, length=320, mode="determinate")
progress_bar_label.grid(row=2, column=0, columnspan=1, padx=5, pady=5, sticky=tk.W)
progress_bar.grid(row=2, column=1, columnspan=2, padx=10, pady=10)

# Bring the default frame to the front
youtube_frame.tkraise()

# Run the main loop
gui_root.mainloop()
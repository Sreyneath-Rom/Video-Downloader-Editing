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

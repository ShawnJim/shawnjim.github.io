import os
import datetime

# Define the directory path
dir_path = 'D:\\tmp\\笔记\\面试突击\\多线程'

# Get list of all files in directory
files = os.listdir(dir_path)

for file in files:
    # Check if the file is a Markdown file
    if file.endswith('.md'):
        # Get the full file path
        full_file_path = os.path.join(dir_path, file)

        # Get the last modification time and convert it to the desired format
        modification_time = os.path.getmtime(full_file_path)
        formatted_time = datetime.datetime.fromtimestamp(modification_time).strftime('%Y-%m-%d')

        # Rename the file to include the modification time at the beginning
        new_file_name = f"{formatted_time}-{file}"
        new_file_path = os.path.join(dir_path, new_file_name)
        os.rename(full_file_path, new_file_path)
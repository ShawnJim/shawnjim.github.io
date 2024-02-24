# -*- coding: utf-8 -*-
import os
import re

# specify the directory you want to start from
rootDir = 'D:\program\RubyProjects\shawnjim.github.io\_thinking'

for dirName, subdirList, fileList in os.walk(rootDir):
    for fname in fileList:
        if fname.endswith('.md'):
            file_path = os.path.join(dirName, fname)
            with open(file_path, 'r', encoding='utf-8') as file:
                lines = file.readlines()
            with open(file_path, 'w', encoding='utf-8') as file:
                for line in lines:
                    file.write(line)
                    if line.startswith('title: '):
                        title = line.split('title: ')[1].strip()
                        file.write('description: ' + title + '\n')
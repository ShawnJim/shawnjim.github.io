import requests
import xml.etree.ElementTree as ET

# 发送GET请求到URL
response = requests.get('https://shawnjim.com/sitemap.xml')

# 解析XML内容
root = ET.fromstring(response.content)

# 打开输出文件
with open('output.txt', 'w') as f:
    # 遍历XML中的所有'url'元素
    for url in root.findall('{http://www.sitemaps.org/schemas/sitemap/0.9}url'):
        # 在'url'元素中找到'loc'元素
        loc = url.find('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')
        # 将URL写入文件
        f.write(loc.text + '\n')
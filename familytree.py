import sys
import os
import json

def main():
	data = ''.join(elem for elem in sys.argv[1])
	data = json.dumps(data);
	print(data["siblings"])

if __name__ == '__main__':
	main()
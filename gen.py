print("maps = [")
for i in range(0, 10):
	print('"', end="")
	for j in range(0, 22):
		print(chr((ord('0') + 2)), end="")
	print('",')
print("];")
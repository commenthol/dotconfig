# 1.5.3 (2024-11-21)

### fix:

- issue key value splitting if line contains more than one equal sign (#e41e1b0)

### test:

- multiline with export (#b52d753)

# 1.5.2 (2024-11-18)

### fix:

- issue with multiline parsing (#49d97f6)

# 1.5.1 (2024-11-18)

### fix:

- issue backslash but no quote character (#e3c85d4)

### docs:

- fix README and document type fields in dotenv.js (#231bd13)

### chore:

- bump dependencies (#612fc1c)

# 1.5.0 (2024-08-10)

### feat:

- cli to encrypt and decrypt values (#47059e7)

### docs:

- document throwOnDecryptionError parameter option (#870d803)

# 1.4.0 (2024-08-04)

### feat:

- encrypted keys (#76f842f)

# 1.3.1 (2024-08-03)

### fix:

- prevent accidential sideloading of files via env-vars (#35f908f)

### docs:

- hide types (#ab7eaa2)

# 1.3.0 (2024-08-03)

### feat:

- load file contents with file:// (#ce5ffd1)

# 1.2.1 (2024-08-02)

### fix:

- issue with arrays on camelCased keys (#4f688c2)

# 1.2.0 (2024-08-01)

### feat:

- group env variables into nested object (#81652af)

### fix:

- rearrange array values (#17ac86b)

### chore:

- bump dependencies (#174a34a)

# 1.1.1 (2024-02-01)

### fix:

- set values on camel cased keys (#9466b2f)

### chore:

- bump dependencies (#bae9f9f)

# 1.1.0 (2024-01-12)

### feat:

- fail if coerced type does not match default (#4e8b686)

### chore:

- bump devDependencies (#f5621f3)

### test:

- add testcase with boolean variable (#57d54d8)

# 1.0.0 (2023-08-14)

### feat:

- dotenv and dotconfig (#3df6fd0)

### fix:

- types (#11699f6)

# 0.2.1 (2023-03-23)

### refactor:

- simplify assignment logic (#9dbffa0)

# 0.2.0 (2023-03-20)

### feat:

- set array values (#a59556d)

# 0.1.2 (2023-03-20)

### fix:

- process env with multiple overlapping keys (#08921bc)

# 0.1.1 (2023-03-20)

### chore:

- publishConfig (#f8b6f87)

# 0.1.0 (2023-03-20)

### feat:

- 🥳 (#369284e)

### other:

- inital commit (#a78a6aa)

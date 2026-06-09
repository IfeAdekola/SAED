import ast
with open(r'C:\SAED\backend\saed\admin.py', 'r') as f:
    src = f.read()
try:
    tree = ast.parse(src)
    print('Syntax OK')
    # Confirm Program is no longer registered
    with open(r'C:\SAED\backend\saed\admin.py', 'r') as f:
        content = f.read()
    print('Contains Program:', 'Program' in content)
    print('Contains ProgramAdmin:', 'ProgramAdmin' in content)
    print('Contains @admin.register(Program):', '@admin.register(Program)' in content)
finally:
    pass

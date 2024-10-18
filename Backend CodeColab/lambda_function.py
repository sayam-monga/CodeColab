import sys
import subprocess
import io
def execute_js_code(js_code):
  
    with open("Temp.js", "w") as file:
        file.write(js_code)
    
   
    run_result = subprocess.run(["node", "Temp.js"], capture_output=True, text=True)
    
    return run_result.stdout if run_result.returncode == 0 else run_result.stderr
def execute_cpp_code(cpp_code):
   
    with open("Temp.cpp", "w") as file:
        file.write(cpp_code)
    
   
    compile_result = subprocess.run(["g++", "-o", "TempExecutable", "Temp.cpp"], capture_output=True, text=True)
    
    if compile_result.returncode != 0:
        return compile_result.stderr  
   
    run_result = subprocess.run(["./TempExecutable"], capture_output=True, text=True)
    
    return run_result.stdout if run_result.returncode == 0 else run_result.stderr
def execute_java_code(java_code):
    with open("Temp.java", "w") as file:
        file.write(java_code)
    compile_result = subprocess.run(["javac", "Temp.java"], capture_output=True, text=True)
    
    if compile_result.returncode != 0:
        return compile_result.stderr  
    
  
    run_result = subprocess.run(["java", "Temp"], capture_output=True, text=True)
    
    return run_result.stdout if run_result.returncode == 0 else run_result.stderr
def execute_python_code(code):
    original_stdout = sys.stdout
    sys.stdout = output_capture = io.StringIO()
    
    try:
        exec(code) 
        output = output_capture.getvalue()  
        return output
    except Exception as e:
        return str(e)
    finally:
        sys.stdout = original_stdout
def handler(event, context):
    language = event.get('language' , 'javascript')
    code = event.get('code' , '')
    if language=='javascript':
        result = execute_js_code(code)
    elif language=='cpp':
        result = execute_cpp_code(code)
    elif language=='java':
        result = execute_java_code(code)
    elif language == 'python' :
        result = execute_python_code(code)
    else:
        result = 'Unsupported Language' +language
    return{
        'statusCode': 200,
        'body': result
    }
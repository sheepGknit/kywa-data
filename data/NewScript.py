import json

def assign_id_and_extract(input_file, id_added_file, empty_output_file):
    # 1. JSON 데이터 읽기
    with open(input_file, 'r', encoding='utf-8') as f:
        programs = json.load(f)

    empty_values = ["", "nan", None]
    extracted_data = []

    # 2. 고유 ID 부여 및 빈 데이터 추출
    for index, program in enumerate(programs, start=1):
        # 각 프로그램에 'id'라는 키로 1부터 시작하는 고유 번호 부여
        program['id'] = index
        
        # sggNm이 비어있는지 확인
        current_sggnm = program.get('sggNm')
        if current_sggnm in empty_values or str(current_sggnm).strip() == "":
            extracted_data.append(program)

    # 3. ID가 부여된 전체 데이터를 새로운 파일로 저장 (향후 병합의 기준점이 됨)
    with open(id_added_file, 'w', encoding='utf-8') as f:
        json.dump(programs, f, ensure_ascii=False, indent=4)

    # 4. sggNm이 비어있는 데이터만 따로 저장
    with open(empty_output_file, 'w', encoding='utf-8') as f:
        json.dump(extracted_data, f, ensure_ascii=False, indent=4)

    print("작업 완료:")
    print(f"1. 전체 데이터에 ID가 부여되어 '{id_added_file}' 파일로 저장되었습니다.")
    print(f"2. sggNm이 비어있는 데이터 {len(extracted_data)}개가 '{empty_output_file}' 파일로 추출되었습니다.")

# 코드 실행
# 실제 파일 경로에 맞게 이름을 수정하여 실행하세요.
assign_id_and_extract('programs.json', 'programs_with_id.json', 'sggNone.json')
import json

def update_empty_sggnm(programs_file, sisul_file, output_file):
    # 1. JSON 데이터 읽기
    with open(programs_file, 'r', encoding='utf-8') as f:
        programs = json.load(f)
        
    with open(sisul_file, 'r', encoding='utf-8') as f:
        sisuls = json.load(f)

    # 2. sisul.json에서 sisulNm을 key로, sggNm을 value로 하는 매핑 딕셔너리 생성
    sisul_map = {}
    for sisul in sisuls:
        sisul_nm = sisul.get('sisulNm')
        sgg_nm = sisul.get('sggNm')
        if sisul_nm and sgg_nm:
            sisul_map[sisul_nm] = sgg_nm

    # 3. 비어있다고 판단할 조건 설정 (빈 문자열, "nan", None 등)
    empty_values = "안양시"
    updated_count = 0

    # 4. programs.json 데이터를 순회하며 조건에 맞게 값 채우기
    for program in programs:
        current_sggnm = program.get('sggNm')
        
        # sggNm이 비어있는지 확인
        if current_sggnm in empty_values or str(current_sggnm).strip() == "":
            facility_name = program.get('facilityName')
            
            # 매핑 딕셔너리에 facilityName이 존재하는지 확인하고 값 업데이트
            if facility_name in sisul_map:
                program['sggNm'] = sisul_map[facility_name]
                updated_count += 1

    # 5. 업데이트된 데이터를 새로운 JSON 파일로 저장
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(programs, f, ensure_ascii=False, indent=4)

    print(f"작업 완료: 총 {updated_count}개의 'sggNm' 데이터가 업데이트 되었습니다.")

# 코드 실행
# 실제 파일 경로에 맞게 이름을 수정하여 실행하세요.
update_empty_sggnm('programs.json', 'sisul.json', 'programs_updated.json')
import json

def merge_updated_data(base_file, updated_file, output_file):
    # 1. ID가 포함된 전체 원본 데이터 읽기
    with open(base_file, 'r', encoding='utf-8') as f:
        base_programs = json.load(f)
        
    # 2. sggNm을 채워 넣은 수정본 데이터 읽기
    with open(updated_file, 'r', encoding='utf-8') as f:
        updated_programs = json.load(f)

    # 3. 수정본 데이터를 ID를 키(Key)로 하는 딕셔너리로 변환 (검색 속도 향상)
    updated_map = {item['id']: item for item in updated_programs if 'id' in item}
    merged_count = 0

    # 4. 원본 데이터를 순회하며 일치하는 ID가 있으면 해당 값으로 덮어쓰기
    for i, program in enumerate(base_programs):
        prog_id = program.get('id')
        if prog_id in updated_map:
            base_programs[i] = updated_map[prog_id]
            merged_count += 1

    # 5. 병합이 완료된 최종 데이터를 저장
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(base_programs, f, ensure_ascii=False, indent=4)

    print(f"작업 완료: 총 {merged_count}개의 데이터가 성공적으로 병합되어 '{output_file}'로 저장되었습니다.")

# 향후 병합 시 사용할 코드 예시
merge_updated_data('programs.json', 'sggNone.json', 'programs_final.json')
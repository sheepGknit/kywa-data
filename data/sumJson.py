import json

def merge_json_files(file1_path, file2_path, output_path):
    # 1. 파일 읽기
    with open(file1_path, 'r', encoding='utf-8') as f1:
        data1 = json.load(f1)
        
    with open(file2_path, 'r', encoding='utf-8') as f2:
        data2 = json.load(f2)
        
    # 2. 데이터 합치기
    combined_raw = data1 + data2
    
    # 3. 중복 제거 (활동명 + 기관명 + 활동일 기준)
    merged_data = []
    seen = set()
    
    for item in combined_raw:
        # 고유 식별 키 생성
        unique_key = (
            item.get('activityName', ''),
            item.get('facilityName', ''),
            item.get('activityDate', '')
        )
        
        if unique_key not in seen:
            seen.add(unique_key)
            merged_data.append(item)
            
    # 4. 병합된 결과 저장
    with open(output_path, 'w', encoding='utf-8') as out_f:
        json.dump(merged_data, out_f, ensure_ascii=False, indent=2)
        
    print(f" 병합 완료!")
    print(f"- 파일 1 데이터 수: {len(data1)}개")
    print(f"- 파일 2 데이터 수: {len(data2)}개")
    print(f"- 중복 제거 후 최종 데이터 수: {len(merged_data)}개")
    print(f"- 저장 위치: {output_path}")

# 실행
if __name__ == '__main__':
    file1 = 'programs_page_1_to_10 (1).json'
    file2 = 'programs_eyouth.json'
    output = 'programs_merged.json'
    
    merge_json_files(file1, file2, output)
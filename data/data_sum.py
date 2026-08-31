import pandas as pd
import json

# 1. 데이터 로드
with open('programs.json', 'r', encoding='utf-8') as f:
    programs_data = json.load(f)
with open('sisul.json', 'r', encoding='utf-8') as f:
    facilities_data = json.load(f)
with open('pop_data.json', 'r', encoding='utf-8') as f:
    population_data = json.load(f)

# 2. 명칭 통합 및 약어 변환 맵
sido_map = {
    "서울특별시": "서울", "부산광역시": "부산", "대구광역시": "대구",
    "인천광역시": "인천", "대전광역시": "대전", "울산광역시": "울산",
    "세종특별자치시": "세종", "경기도": "경기", "강원특별자치도": "강원",
    "충청북도": "충북", "충청남도": "충남", "전북특별자치도": "전북",
    "경상북도": "경북", "경상남도": "경남", "제주특별자치도": "제주",
    # 광주, 전남 통합 처리
    "광주광역시": "전남광주", "전라남도": "전남광주",
    "광주": "전남광주", "전남": "전남광주",
    "전남광주통합특별시": "전남광주"
}

# 3. [D열] 프로그램 수 계산
df_prog = pd.DataFrame(programs_data)
df_prog['시도'] = df_prog['sidoNm'].str.strip().apply(lambda x: sido_map.get(x, x))
df_prog['시군구'] = df_prog['sggNm'].str.strip()
prog_count = df_prog.groupby(['시도', '시군구']).size().reset_index(name='프로그램 수')

# 4. [C열] 시설 수 계산
df_fac = pd.DataFrame(facilities_data)
df_fac['시도'] = df_fac['ctpvNm'].str.strip().apply(lambda x: sido_map.get(x, x))
df_fac['시군구'] = df_fac['sggNm'].str.strip()
fac_count = df_fac.groupby(['시도', '시군구']).size().reset_index(name='시설 수')

# 5. [E열] 인구수 데이터 추출
pop_list = []
for sido, sgg_dict in population_data.items():
    if sido == "전국": 
        continue
    
    mapped_sido = sido_map.get(sido, sido)
    
    for sgg, data in sgg_dict.items():
        if sgg == "소계": 
            continue
        pop = data.get("총인구수", {}).get("2026.06월", 0)
        pop_list.append({'시도': mapped_sido, '시군구': sgg, '인구수': pop})
        
df_pop = pd.DataFrame(pop_list)
df_pop = df_pop.groupby(['시도', '시군구'])['인구수'].sum().reset_index()

# 6. 데이터 병합 (Outer Join)
result_df = pd.merge(fac_count, prog_count, on=['시도', '시군구'], how='outer')
result_df = pd.merge(result_df, df_pop, on=['시도', '시군구'], how='outer')

# 7. 결측치 및 자료형 변환
result_df = result_df.fillna(0)
result_df['시설 수'] = result_df['시설 수'].astype(int)
result_df['프로그램 수'] = result_df['프로그램 수'].astype(int)
result_df['인구수'] = result_df['인구수'].astype(int)

# 8. 최종 결과물 정렬
result_df = result_df[['시도', '시군구', '시설 수', '프로그램 수', '인구수']]
result_df = result_df.sort_values(by=['시도', '시군구']).reset_index(drop=True)

# 9. 엑셀 파일로 내보내기
# 주의: 실행 환경에 openpyxl 라이브러리가 설치되어 있어야 합니다. (pip install openpyxl)
excel_filename = 'regional_statistics_data.xlsx'
result_df.to_excel(excel_filename, index=False, engine='openpyxl')
print(f"데이터가 {excel_filename} 파일로 저장되었습니다.")
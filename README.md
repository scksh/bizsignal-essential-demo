# BizSignal 축소 데모

[데모 열기](https://scksh.github.io/bizsignal-essential-demo/)

공공 용역 공고를 탐색하고, 참가 조건의 원문 근거와 발주계획·계약의 연결을 확인하는 한국어 데모입니다. [기존 BizSignal 데모](https://github.com/scksh/bizsignal-demo)의 디자인을 적용했습니다.

## 데이터 범위

2026년 11월 17일 09시(KST) 기준으로 공고 26건, 발주계획 21건, 계약 49건과 공식 첨부 메타데이터 30건을 사용합니다. 화면의 집계는 수집 표본 기준입니다. 공고와 직접 연결된 계약과 과업이 유사한 계약은 따로 표시합니다.

[원천 사용 컬럼 및 분석 매핑 CSV](./definitions/)

## 실행

저장소 루트에서 다음 명령으로 로컬 정적 서버를 실행한 후 브라우저에서 `http://localhost:8000`을 엽니다.

```sh
python -m http.server 8000
```

GitHub Pages는 `main` 브랜치의 루트에서 배포됩니다. 공고 도우미는 배포 페이지에 포함된 그래프와 색인을 브라우저에서 검색합니다.
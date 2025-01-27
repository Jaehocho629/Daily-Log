document.addEventListener("DOMContentLoaded", () => {
  const logForm = document.getElementById("logForm");
  const logList = document.getElementById("logList");
  const categoryCount = document.getElementById("categoryCount");
  const downloadBtn = document.getElementById("downloadBtn");
  const mainCategory = document.getElementById("mainCategory");
  const subCategory1 = document.getElementById("subCategory1");
  const subCategory2 = document.getElementById("subCategory2");
  let logs = [];

  // 대분류와 소분류 데이터 구조
  const categoryData = {
    MNG: {
      subCategory1: ["TVU-1", "TVU-2", "TVU-3", "TVU-4", "TVU-5", "TVU-6", "TVU-7", "LU-8", "LU-9", "LU-10", "LU-11", "LU-12", "LU-13", "LU-14", "LU-15", "LU-16", "LU-17", "LU-18"],
      subCategory2: ["Live", "Non-Live"], // 소분류 2에 Live와 Non-Live 추가
    },
    "N.O": {
      subCategory1: ["LG 6-1", "LG 6-2", "LG 6-3", "LG 6-4", "KT 수시 -1", "KT 수시 -2", "KT 수시 -3", "KT 수시 -4", "KT 수시 -5", "KT 수시 -6", "KT 수시 -7"],
      subCategory2: ["KBS", "MBC", "SBS", "YTN", "OBS"],
    },
    재난정보: {
      subCategory1: ["안내", "재난", "기상속보"],
      subCategory2: [],
    },
    중계차: {
      subCategory1: ["LG Main & Sub"],
      subCategory2: [],
    },
  };

  // 대분류 변경 시 소분류 업데이트
  mainCategory.addEventListener("change", () => {
    updateSubCategories(mainCategory.value);
  });

  function updateSubCategories(selectedMainCategory) {
    const data = categoryData[selectedMainCategory];

    // 소분류 1 업데이트
    subCategory1.innerHTML = "";
    data.subCategory1.forEach((subCat) => {
      const option = document.createElement("option");
      option.value = subCat;
      option.textContent = subCat;
      subCategory1.appendChild(option);
    });

    // 소분류 2 업데이트
    subCategory2.innerHTML = "";
    data.subCategory2.forEach((subCat) => {
      const option = document.createElement("option");
      option.value = subCat;
      option.textContent = subCat;
      subCategory2.appendChild(option);
    });
  }

  // 초기 소분류 설정
  updateSubCategories(mainCategory.value);

  // 일지 추가 이벤트
  logForm.addEventListener("submit", (event) => {
    event.preventDefault();

    // 입력 값 가져오기
    let time = document.getElementById("time").value.trim();
    const mainCat = mainCategory.value;
    const subCat1 = subCategory1.value;
    const subCat2 = subCategory2.value === "Live" ? "Live" : ""; // 소분류 2에서 Live가 아닌 경우 공란 처리
    const content = document.getElementById("content").value;

    // 시간 형식 처리
    if (!time.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
      alert("시간 형식이 잘못되었습니다. 예: 13:45 또는 13:45:15");
      return;
    }

    logs.push({ time, mainCat, subCat1, subCat2, content });

    // UI 업데이트
    updateLogList();
    updateCategoryCount();

    // 입력 필드 초기화
    logForm.reset();
    updateSubCategories(mainCategory.value); // 대분류 초기화 후 소분류 재설정
  });

  // 일지 목록 업데이트
  function updateLogList() {
    // 시간 순 정렬
    logs.sort((a, b) => a.time.localeCompare(b.time));

    // 중복 항목 그룹화
    const groupedLogs = logs.reduce((acc, log) => {
      const key = `${log.mainCat}/${log.subCat1}/${log.subCat2}/${log.content}`;
      if (!acc[key]) {
        acc[key] = { times: [], log };
      }
      acc[key].times.push(log.time);
      return acc;
    }, {});

    // 목록 출력
    logList.innerHTML = Object.values(groupedLogs)
      .map(({ times, log }) => {
        const subCatText = log.subCat2 ? `${log.subCat1} ${log.subCat2}` : log.subCat1; // '/' 제거

        // 시간 목록 출력
        const timeList = times.map((t) => (log.subCat2 === "Live" ? `<u>${t}</u>` : t.slice(0, 5))).join(" ");

        return `<li>▶ ${timeList} ${subCatText} ${log.content}</li>`;
      })
      .join("");
  }

  // 카테고리별 카운트 (대분류 전체 카운트 및 Live 카운트)
  function updateCategoryCount() {
    const count = logs.reduce(
      (acc, log) => {
        acc[log.mainCat] = acc[log.mainCat] || { total: 0, live: 0 };
        acc[log.mainCat].total += 1;
        if (log.subCat2 === "Live") {
          acc[log.mainCat].live += 1;
        }
        return acc;
      },
      {} // 초기값은 빈 객체
    );

    categoryCount.innerHTML = Object.entries(count)
      .map(([category, { total, live }]) => `<li>${category}: ${total} (${live})</li>`)
      .join("");
  }

  // TXT 파일로 다운로드
  downloadBtn.addEventListener("click", () => {
    const logText = logs
      .map(
        (log) =>
          `▶ ${log.time}\t${log.mainCat}/${log.subCat1}${
            log.subCat2 ? ` ${log.subCat2}` : ""
          }\t${log.content}`
      )
      .join("\n");
    const blob = new Blob([logText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "일지.txt";
    link.click();
  });
});

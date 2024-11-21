// options.js

document.addEventListener("DOMContentLoaded", restoreOptions);
document
  .getElementById("update-button")
  .addEventListener("click", saveTemplates);

function saveTemplates() {
  const repoName = document.getElementById("repo-name").value.trim();
  const templateNames = document.getElementById("template-names").value.trim();

  if (!repoName || !templateNames) {
    alert("全てのフィールドを入力してください。");
    return;
  }

  // テンプレート名をカンマで分割し、配列に変換
  const templateArray = templateNames
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name);

  // 保存するデータ構造
  const newData = {
    repoName,
    templateNames: templateArray,
  };

  chrome.storage.local.get({ templates: [] }, function (result) {
    let templates = result.templates;

    // 既存のリポジトリがあるか確認
    const existingIndex = templates.findIndex(
      (item) => item.repoName === repoName
    );

    if (existingIndex >= 0) {
      // 既存のリポジトリを更新
      templates[existingIndex].templateNames = templateArray;
    } else {
      // 新しいリポジトリを追加
      templates.push(newData);
    }

    chrome.storage.local.set({ templates }, function () {
      alert("テンプレートが保存されました。");
      displayTemplates();
    });
  });
}

function restoreOptions() {
  displayTemplates();
}

function displayTemplates() {
  // chrome.storage.local.clear();
  chrome.storage.local.get({ templates: [] }, function (result) {
    const templates = result.templates;
    const templateList = document.getElementById("template-list");
    templateList.innerHTML = "";

    templates.forEach((item, index) => {
      const templateDiv = document.createElement("div");
      templateDiv.className = "template-item";

      const templateNames = item.templateNames
        .map((name) => `<li>${name}</li>`)
        .join("");
      console.log(templateNames);
      templateDiv.innerHTML = `
        <p class="p-title" ><strong>リポジトリ名：</strong> ${item.repoName}</p>
        <p class="p-title" ><strong>テンプレート名：</strong></p>
        <ul>${templateNames}</ul>
        <button data-index="${index}" class="edit-button">編集</button>
        <button data-index="${index}" class="delete-button">削除</button>
        ${index === templates.length - 1 ? "" : "<hr>"}
      `;
      templateList.appendChild(templateDiv);
    });

    // 削除ボタンにイベントリスナーを追加
    const deleteButtons = document.getElementsByClassName("delete-button");
    Array.from(deleteButtons).forEach((button) => {
      button.addEventListener("click", deleteTemplate);
    });

    // 編集ボタンにイベントリスナーを追加
    const editButtons = document.getElementsByClassName("edit-button");
    console.log("編集ボタンの数:", editButtons.length); // 追加
    Array.from(editButtons).forEach((button) => {
      button.addEventListener("click", editTemplate);
    });
  });
}

function deleteTemplate(e) {
  const index = e.target.getAttribute("data-index");
  // アラート
  if (!confirm("本当に削除しますか？")) {
    return;
  }

  chrome.storage.local.get({ templates: [] }, function (result) {
    let templates = result.templates;
    templates.splice(index, 1);
    chrome.storage.local.set({ templates }, function () {
      displayTemplates();
    });
  });
}

function editTemplate(e) {
  console.log("edit");

  const index = e.target.getAttribute("data-index");
  // テンプレート情報を取得
  chrome.storage.local.get({ templates: [] }, function (result) {
    const templates = result.templates;
    console.log(templates);

    const targetTemplate = templates[index];

    // フォームに値をセット
    document.getElementById("repo-name").value = targetTemplate.repoName;
    document.getElementById("template-names").value =
      targetTemplate.templateNames.join(", ");

    // 保存ボタンを更新モードに変更
    const updateButton = document.getElementById("update-button");
    updateButton.dataset.index = index;
    updateButton.innerText = "更新";
  });
}

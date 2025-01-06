function init(trigger) {
  console.log("content script ", trigger);

  // リポジトリ名を取得
  const repoPath = location.pathname.split("/");
  if (repoPath.length < 3) return;
  const currentRepo = repoPath[2];

  // テンプレート情報を取得
  chrome.storage.local.get({ templates: [] }, function (result) {
    const filteredTemplates = result.templates.filter(
      (template) => template.repoName === currentRepo
    );

    if (filteredTemplates.length === 0) return;

    const templates = filteredTemplates[0].templateNames;

    // セレクトボックスを作成
    const select = document.createElement("select");
    select.className = "template-selector";

    const defaultOption = document.createElement("option");
    defaultOption.text = location.search
      ? new URL(location.href).searchParams
          .get("template")
          ?.replace(".md", "") || "select a template"
      : "select a template";
    defaultOption.value = "";
    select.appendChild(defaultOption);

    templates.forEach((template) => {
      if (defaultOption.text === template) return;
      const option = document.createElement("option");
      option.text = template;
      option.value = template;
      select.appendChild(option);
    });

    const wrapper = document.createElement("div");
    wrapper.className = "pr-select-wrapper";
    wrapper.appendChild(select);

    const header = document.querySelector("div.compare-show-header.Subhead");
    if (header && !document.querySelector(".pr-select-wrapper")) {
      header.parentNode.insertBefore(wrapper, header.nextSibling);
      successInjectSelect = true; // 成功フラグを設定
    }

    select.addEventListener("change", function () {
      const selectedTitle = this.value;
      if (selectedTitle) {
        const selectedTemplate = templates.find((t) => t === selectedTitle);
        if (selectedTemplate) {
          const url = new URL(window.location.href);
          url.searchParams.set("template", `${selectedTitle}.md`);
          window.location.href = url.toString();
        }
      }
    });
  });
}

let currentUrl = location.href;
let successInjectSelect = false;

// URL変更を監視
setInterval(() => {
  if (currentUrl !== location.href) {
    currentUrl = location.href;
    successInjectSelect = false; // フラグをリセット
    init("url change"); // URL変更時に再実行
  }
}, 1000);

// 初期化チェック
setInterval(() => {
  if (
    !successInjectSelect &&
    document.querySelector("div.compare-show-header.Subhead")
  ) {
    init("header");
  }
}, 1000);

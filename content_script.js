document.addEventListener(
  "DOMContentLoaded",
  (function () {
    // リポジトリ名を取得
    const repoPath = location.pathname.split("/");

    if (repoPath.length < 3) return;
    const currentRepo = repoPath[2];

    // テンプレート情報を取得
    chrome.storage.local.get({ templates: [] }, function (result) {
      const templates = result.templates.filter(
        (template) => template.repoName === currentRepo
      )[0].templateNames;

      console.log(templates);

      if (templates.length === 0) return; // テンプレートがない場合は終了

      // セレクトボックスを作成
      const select = document.createElement("select");
      select.className = "template-selector";

      const defaultOption = document.createElement("option");

      // テンプレートが指定されている場合は、デフォルトの選択肢を該当テンプレートにする
      if (location.search) {
        const url = new URL(location.href);
        const template = url.searchParams.get("template");
        if (template) {
          defaultOption.text = template.replace(".md", "");
          defaultOption.value = "";
        } else {
          defaultOption.text = "select a template";
          defaultOption.value = "";
        }
      }

      select.appendChild(defaultOption);

      templates.forEach((template) => {
        if (defaultOption.text === template) return; // デフォルトの選択肢と重複する場合はスキップ
        const option = document.createElement("option");
        option.text = template;
        option.value = template;
        select.appendChild(option);
      });

      // 擬似要素をつけるため、セレクトボックスをラップする
      const wrapper = document.createElement("div");
      wrapper.className = "pr-select-wrapper";
      wrapper.appendChild(select);

      // セレクトボックスを指定の位置に挿入
      const header = document.querySelector("div.compare-show-header.Subhead");
      if (header) {
        header.parentNode.insertBefore(wrapper, header.nextSibling);
      }

      // 選択時のイベントリスナーを追加
      select.addEventListener("change", function () {
        const selectedTitle = this.value;
        if (selectedTitle) {
          const selectedTemplate = templates.find((t) => t === selectedTitle);
          if (selectedTemplate) {
            // URLを更新
            const url = new URL(window.location.href);
            url.searchParams.set("template", `${selectedTitle}.md`);
            window.location.href = url.toString();
          }
        }
      });
    });
  })()
);

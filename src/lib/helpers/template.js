
const hRayTemplate = `
<div class="fields row">
  <div class="field three wide column label">Line</div>
  <div class="field three wide column color">
    <input type="text" style="display:none" class="color-wrapper" key="mainLine.lineColor"/>
  </div>
  <div class="field four wide column">
    <div class="ui fluid input">
      <input class="line-thickness input-box" type="number" min="1" max="4" key="mainLine.lineThickness"/>
    </div>
  </div>
  <div class="field four wide column">
    <div class="ui selection dropdown" key="mainLine.lineDashType">
      <input type="hidden" name="lineStyle" value=""/><i class="dropdown icon"></i>
      <div class="default text">
        <div class="tv-line-style-option solid"></div>
      </div>
      <div class="menu">
        <div class="item" data-value="solid">
          <div class="tv-line-style-option solid"></div>
        </div>
        <div class="item" data-value="dot">
          <div class="tv-line-style-option dot"></div>
        </div>
        <div class="item" data-value="dash">
          <div class="tv-line-style-option dash"></div>
        </div>
      </div>
    </div>
  </div>
</div>
<div class="fields row">
  <div class="field six wide column">
    <div class="ui checkbox" key="label.indexVisible">
      <input type="checkbox"/>
      <label>Show Price</label>
    </div>
  </div>
</div>
<div class="fields row">
  <div class="field six wide column">
    <div class="ui checkbox" key="label.visible">
      <input type="checkbox"/>
      <label>Show Text</label>
    </div>
  </div>
</div>
<div class="fields row">
  <div class="field three wide column label">Text:</div>
  <div class="field three wide column color">
    <input type="text" style="display:none" class="color-wrapper" key="label.color"/>
  </div>
  <div class="field four wide column">
    <div class="ui selection dropdown" id="font_family" style="min-width: 100% !important" key="label.fontFamily">
      <input type="hidden" name="font" value=""/><i class="dropdown icon"></i>
      <div class="default text">Font</div>
      <div class="menu">
        <div class="item" data-value="calibri">Calibri</div>
        <div class="item" data-value="optima">Optima</div>
        <div class="item" data-value="candara">Candara</div>
        <div class="item" data-value="verdana">Verdana</div>
        <div class="item" data-value="geneva">Geneva</div>
      </div>
    </div>
  </div>
  <div class="field four wide column">
    <div class="ui selection dropdown" style="min-width: 100% !important" key="label.fontSize">
      <input type="hidden" name="fontSize" value=""/><i class="dropdown icon"></i>
      <div class="default text">Size</div>
      <div class="menu">
        <div class="item" data-value="10">10</div>
        <div class="item" data-value="11">11</div>
        <div class="item" data-value="12">12</div>
        <div class="item" data-value="14">14</div>
        <div class="item" data-value="16">16</div>
        <div class="item" data-value="20">20</div>
        <div class="item" data-value="24">24</div>
        <div class="item" data-value="28">28</div>
        <div class="item" data-value="32">32</div>
        <div class="item" data-value="40">40</div>
      </div>
    </div>
  </div>
  <div class="field three wide column">
    <div class="ui icon buttons">
      <button class="ui button" key="label.fontWeight"><i class="bold icon"></i></button>
      <button class="ui button" key="label.fontStyle"><i class="italic icon"></i></button>
    </div>
  </div>
</div>
<div class="fields row">
  <div class="field three wide column label">Align:</div>
  <div class="field five wide column">
    <div class="ui icon buttons" key="label.align">
      <button class="ui button" data-value="left"><i class="align left icon"></i></button>
      <button class="ui button" data-value="center"><i class="align center icon"></i></button>
      <button class="ui button" data-value="right"><i class="align right icon"></i></button>
    </div>
  </div>
  <div class="field seven wide column">
    <div class="field four wide column">
      <div class="ui icon buttons" key="label.vAlign">
      <button class="ui button" data-value="top">Top</button>
      <button class="ui button" data-value="middle">Middle</button>
      <button class="ui button" data-value="bottom">Bottom</button>
    </div>
  </div>
</div>
<div class="fields">
  <div class="field sixteen wide column input">
    <textarea rows="7" cols="60" style="width: 100%" class="input-box" key="label.text"></textarea>
  </div>
</div>
`;

const arrowTemplate = `
<div class="fields row">
  <div class="field five wide column label">Line</div>
  <div class="field two wide column color">
    <input type="text" style="display:none" class="color-wrapper" key="mainLine.lineColor"/>
  </div>
  <div class="field three wide column">
    <div class="ui fluid input">
      <input type="number" min="1" max="4" class="input-box" style="padding-left:5px; padding-right:5px" key="mainLine.lineThickness"/>
    </div>
  </div>
  <div class="field five wide column">
    <div class="ui selection dropdown" key="mainLine.lineDashType">
      <input type="hidden" name="lineStyle" value=""/><i class="dropdown icon"></i>
      <div class="default text"><div class="tv-line-style-option solid"></div></div>
      <div class="menu">
        <div class="item" data-value="solid"><div class="tv-line-style-option solid"></div></div>
        <div class="item" data-value="dot"><div class="tv-line-style-option dot"></div></div>
        <div class="item" data-value="dash"><div class="tv-line-style-option dash"></div></div>
      </div>
    </div>
  </div>
</div>
<div class="fields row">
  <div class="field five wide column label">Start Arrow</div>
  <div class="field five wide column">
    <div class="ui selection dropdown" style="min-width: 100% !important" key="start.arrow">
      <input type="hidden" name="left-arrow" value=""/><i class="dropdown icon"></i>
      <div class="default text"></div>
      <div class="menu">
        <div class="item" data-value=false>Normal</div>
        <div class="item" data-value=true>Arrow</div>
      </div>
    </div>
  </div>
  <div class="field one wide column">
  </div>
  <div class="field one wide column">
    <div class="ui checkbox" style="padding-top: 8px;" key="start.extend">
      <input type="checkbox"/>
      <label> </label>
    </div>
  </div>
  <div class="field three wide column label">Extend</div>
</div>
<div class="fields row">
  <div class="field five wide column label">End Arrow</div>
  <div class="field five wide column"> 
    <div class="ui selection dropdown" style="min-width: 100% !important" key="end.arrow">
      <input type="hidden" name="right-arrow" value=""/><i class="dropdown icon"></i>
      <div class="default text"></div>
      <div class="menu">
        <div class="item" data-value="false">Normal</div>
        <div class="item" data-value="true">Arrow</div>
      </div>
    </div>
  </div>
  <div class="field one wide column">
  </div>
  <div class="field one wide column">
    <div class="ui checkbox" style="padding-top: 8px;" key="end.extend">
      <input type="checkbox"/>
      <label> </label>
    </div>
  </div>
  <div class="field three wide column label">Extend</div>
</div>
<div class="fields row">
  <div class="field five wide column label">Stats Position:</div>
  <div class="field six wide column">
    <div class="ui icon buttons" key="label.align">
      <button class="ui button" data-value="left"><i class="align left icon"></i></button>
      <button class="ui button" data-value="center"><i class="align center icon"></i></button>
      <button class="ui button" data-value="right"><i class="align right icon"></i></button>
    </div>
  </div>
</div>
<div class="fields row">
  <div class="field five wide column label">Stats Color</div>
  <div class="field three wide column color"> 
    <input type="text" style="display:none" class="color-wrapper" key="label.color"/>
  </div>
</div>
<div class="fields row">
  <div class="field eight wide column">Show Price Range</div>
  <div class="field four wide column">
    <div class="ui checkbox" key="label.extra.price">
      <input type="checkbox"/>
      <label> </label>
    </div>
  </div>
</div>
<div class="fields row">
  <div class="field eight wide column">Show Bar Range</div>
  <div class="field four wide column">
    <div class="ui checkbox" key="label.extra.bars">
      <input type="checkbox"/>
      <label> </label>
    </div>
  </div>
</div>
<div class="fields row">
  <div class="field eight wide column">Show Date/Time Range</div>
  <div class="field four wide column">
    <div class="ui checkbox" key="label.extra.date">
      <input type="checkbox"/>
      <label> </label>
    </div>
  </div>
</div>
<div class="fields row">
  <div class="field eight wide column">Show Distance</div>
  <div class="field four wide column">
    <div class="ui checkbox" key="label.extra.distance">
      <input type="checkbox"/>
      <label> </label>
    </div>
  </div>
</div>
<div class="fields row">
  <div class="field eight wide column">Show Angle</div>
  <div class="field four wide column">
    <div class="ui checkbox" key="label.extra.angle">
      <input type="checkbox"/>
      <label> </label>
    </div>
  </div>
</div>
<div class="fields row">
  <div class="field eight wide column">Always Show Stats</div>
  <div class="field four wide column">
    <div class="ui checkbox" key="label.visible">
      <input type="checkbox"/>
      <label> </label>
    </div>
  </div>
</div>
`;

const fibTemplate = `
<div class="fields row">
  <div class="field one wide column label">
    <div class="ui checkbox" key="mainLine.visible">
      <input type="checkbox"/>
      <label></label>
    </div>
  </div>
  <div class="field four wide column label">Trend Line</div>
  <div class="field three wide column color">
    <input type="text" style="display:none" class="color-wrapper" key="mainLine.lineColor"/>
  </div>
  <div class="field four wide column">
    <div class="ui fluid input">
      <input type="number" min="1" max="4" class="input-box" key="mainLine.lineThickness"/>
    </div>
  </div>
  <div class="field three wide column">
    <div class="ui selection dropdown" key="mainLine.lineDashType">
      <input type="hidden" name="lineStyle" value=""/><i class="dropdown icon"></i>
      <div class="default text"><div class="tv-line-style-option solid"></div></div>
      <div class="menu">
        <div class="item" data-value="solid"><div class="tv-line-style-option solid"></div></div>
        <div class="item" data-value="dot"><div class="tv-line-style-option dot"></div></div>
        <div class="item" data-value="dash"><div class="tv-line-style-option dash"></div></div>
      </div>
    </div>
  </div>
</div>
<div class="fields row">
  <div class="field one wide column label"></div>
  <div class="field four wide column label">Level Line</div>
  <div class="field three wide column color"></div>
  <div class="field four wide column">
    <div class="ui fluid input">
      <input type="number" min="1" max="4" class="input-box" key="levelLine.lineThickness"/>
    </div>
  </div>
  <div class="field three wide column">
    <div class="ui selection dropdown" key="levelLine.lineDashType">
      <input type="hidden" name="lineStyle" value=""/><i class="dropdown icon"></i>
      <div class="default text"><div class="tv-line-style-option solid"></div></div>
      <div class="menu">
        <div class="item" data-value="solid"><div class="tv-line-style-option solid"></div></div>
        <div class="item" data-value="dot"><div class="tv-line-style-option dot"></div></div>
        <div class="item" data-value="dash"><div class="tv-line-style-option dash"></div></div>
      </div>
    </div>
  </div>
</div>
<div class="fields row">
  <div class="field one wide column label">
    <div class="ui checkbox mine" key="extend">
      <input type="checkbox"/>
      <label></label>
    </div>
  </div>
  <div class="field four wide column label">Extend Lines</div>
</div>
<div class="level-wrapper">
</div>
<div class="fields row">
  <div class="field four wide column label">Use One Color</div>
  <div class="field two wide column color">
    <input type="text" style="display:none" class="color-wrapper" key="levelLine.color"/>
  </div>
</div>
<div class="fields row">
  <div class="field four wide column label">Background</div>
  <div class="field one wide column color">
    <div class="ui checkbox mine" key="background.visible">
      <input type="checkbox"/>
      <label></label>
    </div>
  </div>
  <div class="field seven wide column">
    <div class="ui range" key="background.opacity"></div>
  </div>
</div>
<div class="fields row">
  <div class="field three wide column label">
  </div>
  <div class="field three wide column label">
    <div class="ui checkbox mine" key="revert">
      <input type="checkbox"/>
      <label>Reverse</label>
    </div>
  </div>
  <div class="field three wide column label">
    <div class="ui checkbox mine" key="label.extra.levels">
      <input type="checkbox"/>
      <label>Levels</label>
    </div>
  </div>
  <div class="field three wide column label">
    <div class="ui checkbox mine" key="label.extra.price">
      <input type="checkbox"/>
      <label>Prices</label>
    </div>
  </div>
  <div class="field three wide column label">
    <div class="ui checkbox mine" key="label.extra.percents">
      <input type="checkbox"/>
      <label>Percents</label>
    </div>
  </div>
</div>
<div class="fields row">
  <div class="field three wide column">Labels</div>
  <div class="field five wide column">
    <div class="ui icon buttons" key="label.align">
      <button class="ui button" data-value="left"><i class="align left icon"></i></button>
      <button class="ui button" data-value="center"><i class="align center icon"></i></button>
      <button class="ui button" data-value="right"><i class="align right icon"></i></button>
    </div>
  </div>
  <div class="field one wide column"></div>
    <div class="field four wide column">
      <div class="ui icon buttons" key="label.vAlign">
      <button class="ui button" data-value="top">Top</button>
      <button class="ui button" data-value="middle">Middle</button>
      <button class="ui button" data-value="bottom">Bottom</button>
    </div>
  </div>
</div>
`;

const rectTemplate = `
<div class="fields row">
  <div class="field one wide column"></div>
  <div class="field four wide column label">Border</div>
  <div class="field four wide column color">
    <input type="text" style="display:none" class="color-wrapper" key="mainLine.lineColor"/>
  </div>
  <div class="field four wide column">
    <div class="ui fluid input">
      <input type="number" min="1" max="4" class="input-box" key="mainLine.lineThickness"/>
    </div>
  </div>  
</div>
<div class="fields row">
  <div class="field one wide column label">
    <div class="ui checkbox" key="background.visible">
      <input type="checkbox"/>
      <label></label>
    </div>
  </div>
  <div class="field four wide column label">Background:</div>
  <div class="field four wide column color">
    <input type="text" style="display:none" class="color-wrapper" key="background.color"/>
  </div>
</div>
`;

const parallelTemplate = `
<div class="fields row">
  <div class="field four wide column label">Channel</div>
  <div class="field two wide column color">
    <input type="text" style="display:none" class="color-wrapper" key="mainLine.lineColor"/>
  </div>
  <div class="field four wide column">
    <div class="ui fluid input">
      <input type="number" min="1" max="4" class="input-box" key="mainLine.lineThickness"/>
    </div>
  </div>
  <div class="field four wide column">
    <div class="ui selection dropdown" key="mainLine.lineDashType">
      <input type="hidden" name="lineStyle" value=""/><i class="dropdown icon"></i>
      <div class="default text"><div class="tv-line-style-option solid"></div></div>
      <div class="menu">
        <div class="item" data-value="solid"><div class="tv-line-style-option solid"></div></div>
        <div class="item" data-value="dot"><div class="tv-line-style-option dot"></div></div>
        <div class="item" data-value="dash"><div class="tv-line-style-option dash"></div></div>
      </div>
    </div>
  </div>
</div>
<div class="fields row">
  <div class="field one wide column label">
    <div class="ui checkbox mine" key="levelLine.visible">
      <input type="checkbox"/>
      <label></label>
    </div>
  </div>
  <div class="field three wide column label">Middle</div>
  <div class="field two wide column color">
    <input type="text" style="display:none" class="color-wrapper" key="levelLine.lineColor"/>
  </div>
  <div class="field four wide column">
    <div class="ui fluid input">
      <input type="number" min="1" max="4" class="input-box" key="levelLine.lineThickness"/>
    </div>
  </div>
  <div class="field four wide column">
    <div class="ui selection dropdown" key="levelLine.lineDashType">
      <input type="hidden" name="lineStyle" value=""/><i class="dropdown icon"></i>
      <div class="default text"><div class="tv-line-style-option solid"></div></div>
      <div class="menu">
        <div class="item" data-value="solid"><div class="tv-line-style-option solid"></div></div>
        <div class="item" data-value="dot"><div class="tv-line-style-option dot"></div></div>
        <div class="item" data-value="dash"><div class="tv-line-style-option dash"></div></div>
      </div>
    </div>
  </div>
</div>
<div class="fields row">
  <div class="field one wide column label">
    <div class="ui checkbox mine" key="start.extend">
      <input type="checkbox"/>
      <label></label>
    </div>
  </div>
  <div class="field six wide column label">Extend left line</div>
</div>
<div class="fields row">
  <div class="field one wide column label">
    <div class="ui checkbox mine" key="end.extend">
      <input type="checkbox"/>
      <label></label>
    </div>
  </div>
  <div class="field six wide column label">Extend right line</div>
</div>
<div class="fields row">
  <div class="field one wide column label">
    <div class="ui checkbox" key="background.visible">
      <input type="checkbox"/>
      <label></label>
    </div>
  </div>
  <div class="field four wide column label">Background:</div>
  <div class="field four wide column color">
    <input type="text" style="display:none" class="color-wrapper" key="background.color"/>
  </div>
</div>
`;

const textTemplate = `
<div class="fields row">
  <div class="field one wide column"></div>
  <div class="field two wide column color">
    <input type="text" style="display:none" class="color-wrapper" key="label.color"/>
  </div>
  <div class="field four wide column">
    <div class="ui selection dropdown" style="min-width: 100% !important" key="label.fontFamily">
      <input type="hidden" name="font" value=""/><i class="dropdown icon"></i>
      <div class="default text">Font</div>
      <div class="menu">
        <div class="item" data-value="calibri">Calibri</div>
        <div class="item" data-value="optima">Optima</div>
        <div class="item" data-value="candara">Candara</div>
        <div class="item" data-value="verdana">Verdana</div>
        <div class="item" data-value="geneva" ng-click="tbOption.label.fontFamily = 'geneva'; redraw(tbOption);">Geneva</div>
      </div>
    </div>
  </div>
  <div class="field four wide column">
    <div class="ui selection dropdown" style="min-width: 100% !important" key="label.fontSize">
      <input type="hidden" name="fontSize" value=""/><i class="dropdown icon"></i>
      <div class="default text">Size</div>
      <div class="menu">
        <div class="item" data-value="10">10</div>
        <div class="item" data-value="11">11</div>
        <div class="item" data-value="12">12</div>
        <div class="item" data-value="14">14</div>
        <div class="item" data-value="16">16</div>
        <div class="item" data-value="20">20</div>
        <div class="item" data-value="24">24</div>
        <div class="item" data-value="28">28</div>
        <div class="item" data-value="32">32</div>
        <div class="item" data-value="40">40</div>
      </div>
    </div>
  </div>
  <div class="field two wide column">
    <div class="ui icon buttons">
      <button class="ui button" key="label.fontWeight"><i class="bold icon"></i></button>
    </div>
  </div>
  <div class="field two wide column">
    <div class="ui icon buttons">
      <button class="ui button" key="label.fontStyle"><i class="italic icon"></i></button>
    </div>
  </div>
</div>
<div class="fields">
  <div class="field sixteen wide column input">
    <textarea rows="7" cols="60" style="width: 100%" class="input-box" key="label.text"></textarea>
  </div>
</div>
<div class="fields row">
  <div class="field one column"></div>
  <div class="field four wide column label">Border</div>
  <div class="field two wide column color">
    <input type="text" style="display:none" class="color-wrapper" key="mainLine.lineColor"/>
  </div>
  <div class="field four wide column">
    <div class="ui fluid input">
      <input type="number" min="1" max="4" key="mainLine.lineThickness" class="input-box"/>
    </div>
  </div>
</div>
<div class="fields row">
  <div class="field one column"></div>
  <div class="field four wide column label">Background</div>
  <div class="field two wide column color">
    <input type="text" style="display:none" class="color-wrapper" key="background.color"/>
  </div>  
</div>
`;

const harmonicTemplate = `
<div class="fields row">
  <div class="field one wide column"></div>
  <div class="field four wide column label">Border</div>
  <div class="field four wide column color">
    <input type="text" style="display:none" class="color-wrapper" key="mainLine.lineColor"/>
  </div>
  <div class="field four wide column">
    <div class="ui fluid input">
      <input type="number" min="1" max="4" key="mainLine.lineThickness" class="input-box"/>
    </div>
  </div>
</div>
<div class="fields row">
  <div class="field one wide column label">
    <div class="ui checkbox" key="background.visible">
      <input type="checkbox"/>
      <label></label>
    </div>
  </div>
  <div class="field four wide column label">Background:</div>
  <div class="field four wide column color">
    <input type="text" style="display:none" class="color-wrapper" key="background.color"/>
  </div>  
</div>
<div class="fields row">
  <div class="field one wide column"></div>
  <div class="field two wide column color">
    <input type="text" style="display:none" class="color-wrapper" key="label.color"/>
  </div>
  <div class="field four wide column">
    <div class="ui selection dropdown" style="min-width: 100% !important" key="label.fontFamily">
      <input type="hidden" name="font" value=""/><i class="dropdown icon"></i>
      <div class="default text">Font</div>
      <div class="menu">
        <div class="item" data-value="calibri">Calibri</div>
        <div class="item" data-value="optima">Optima</div>
        <div class="item" data-value="candara">Candara</div>
        <div class="item" data-value="verdana">Verdana</div>
        <div class="item" data-value="geneva">Geneva</div>
      </div>
    </div>
  </div>
  <div class="field four wide column">
    <div class="ui selection dropdown" style="min-width: 100% !important" key="label.fontSize">
      <input type="hidden" name="fontSize" value=""/><i class="dropdown icon"></i>
      <div class="default text">Size</div>
      <div class="menu">
        <div class="item" data-value="10">10</div>
        <div class="item" data-value="11">11</div>
        <div class="item" data-value="12">12</div>
        <div class="item" data-value="14">14</div>
        <div class="item" data-value="16">16</div>
        <div class="item" data-value="20">20</div>
        <div class="item" data-value="24">24</div>
        <div class="item" data-value="28">28</div>
        <div class="item" data-value="32">32</div>
        <div class="item" data-value="40">40</div>
      </div>
    </div>
  </div>
  <div class="field two wide column">
    <div class="ui icon buttons">
      <button class="ui button" key="label.fontWeight"><i class="bold icon"></i></button>
    </div>
  </div>
  <div class="field two wide column">
    <div class="ui icon buttons">
      <button class="ui button" key="label.fontStyle"><i class="italic icon"></i></button>
    </div>
  </div>
</div>
`;

const abcdTemplate = `
<div class="fields row">
  <div class="field one wide column"></div>
  <div class="field four wide column label">Border</div>
  <div class="field four wide column color">
    <input type="text" style="display:none" class="color-wrapper" key="mainLine.lineColor"/>
  </div>
  <div class="field four wide column">
    <div class="ui fluid input">
      <input type="number" min="1" max="4" key="mainLine.lineThickness" class="input-box"/>
    </div>
  </div>
</div>
<div class="fields row">
  <div class="field one wide column"></div>
  <div class="field two wide column color">
    <input type="text" style="display:none" class="color-wrapper" key="label.color"/>
  </div>
  <div class="field four wide column">
    <div class="ui selection dropdown" style="min-width: 100% !important" key="label.fontFamily">
      <input type="hidden" name="font" value=""/><i class="dropdown icon"></i>
      <div class="default text">Font</div>
      <div class="menu">
        <div class="item" data-value="calibri">Calibri</div>
        <div class="item" data-value="optima">Optima</div>
        <div class="item" data-value="candara">Candara</div>
        <div class="item" data-value="verdana">Verdana</div>
        <div class="item" data-value="geneva">Geneva</div>
      </div>
    </div>
  </div>
  <div class="field four wide column">
    <div class="ui selection dropdown" style="min-width: 100% !important" key="label.fontSize">
      <input type="hidden" name="fontSize" value=""/><i class="dropdown icon"></i>
      <div class="default text">Size</div>
      <div class="menu">
        <div class="item" data-value="10">10</div>
        <div class="item" data-value="11">11</div>
        <div class="item" data-value="12">12</div>
        <div class="item" data-value="14">14</div>
        <div class="item" data-value="16">16</div>
        <div class="item" data-value="20">20</div>
        <div class="item" data-value="24">24</div>
        <div class="item" data-value="28">28</div>
        <div class="item" data-value="32">32</div>
        <div class="item" data-value="40">40</div>
      </div>
    </div>
  </div>
  <div class="field two wide column">
    <div class="ui icon buttons">
      <button class="ui button" key="label.fontWeight"><i class="bold icon"></i></button>
    </div>
  </div>
  <div class="field two wide column">
    <div class="ui icon buttons">
      <button class="ui button" key="label.fontStyle"><i class="italic icon"></i></button>
    </div>
  </div>
</div>
`;

const waveTemplate = `
<div class="fields row">
  <div class="field four wide column label">Wave</div>
  <div class="field four wide column color">
    <input type="text" style="display:none" class="color-wrapper" key="mainLine.lineColor"/>
  </div>
  <div class="field four wide column">
    <div class="ui fluid input">
      <input type="number" min="1" max="4" class="input-box" key="mainLine.lineThickness"/>
    </div>
  </div>
</div>
<div class="fields row">
  <div class="field one wide column"></div>
  <div class="field two wide column color">
    <input type="text" style="display:none" class="color-wrapper" key="label.color"/>
  </div>
  <div class="field four wide column">
    <div class="ui selection dropdown" style="min-width: 100% !important" key="label.fontFamily">
      <input type="hidden" name="font" value=""/><i class="dropdown icon"></i>
      <div class="default text">Font</div>
      <div class="menu">
        <div class="item" data-value="calibri">Calibri</div>
        <div class="item" data-value="optima">Optima</div>
        <div class="item" data-value="candara">Candara</div>
        <div class="item" data-value="verdana">Verdana</div>
        <div class="item" data-value="geneva">Geneva</div>
      </div>
    </div>
  </div>
  <div class="field four wide column">
    <div class="ui selection dropdown" style="min-width: 100% !important" key="label.fontSize">
      <input type="hidden" name="fontSize" value=""/><i class="dropdown icon"></i>
      <div class="default text">Size</div>
      <div class="menu">
        <div class="item" data-value="10">10</div>
        <div class="item" data-value="11">11</div>
        <div class="item" data-value="12">12</div>
        <div class="item" data-value="14">14</div>
        <div class="item" data-value="16">16</div>
        <div class="item" data-value="20">20</div>
        <div class="item" data-value="24">24</div>
        <div class="item" data-value="28">28</div>
        <div class="item" data-value="32">32</div>
        <div class="item" data-value="40">40</div>
      </div>
    </div>
  </div>
  <div class="field two wide column">
    <div class="ui icon buttons">
      <button class="ui button" key="label.fontWeight"><i class="bold icon"></i></button>
    </div>
  </div>
  <div class="field two wide column">
    <div class="ui icon buttons">
      <button class="ui button" key="label.fontStyle"><i class="italic icon"></i></button>
    </div>
  </div>
</div>
`;

const templates = {
  'line-setting': hRayTemplate,
  'arrow-setting': arrowTemplate,
  'fib-setting': fibTemplate,
  'rect-setting': rectTemplate,
  'text-setting': textTemplate,
  'harmonic-setting': harmonicTemplate,
  'abcd-setting': abcdTemplate,
  'wave-setting': waveTemplate,
  'parallel-setting': parallelTemplate
};

export function getTemplates (key) {
  return `<div class="setting-modal tfa-modal toolbar-algebra-setting" style="padding: 10px">
    <div class="content" style="padding-top: 0px">
      <div class="ui top attached tabular menu">
        <a class="item active" data-tab="style-tab">Style</a>
        <a class="item" data-tab="coordinate-tab">Coordinates</a>
      </div>
      <div class="ui bottom attached tab segment active grid style" style="margin-bottom: 1em" data-tab="style-tab">
        ${templates[key]}
      </div>
      <div class="ui bottom attached tab segment grid" style="margin-bottom: 1em" data-tab="coordinate-tab"></div>
    </div>
    <div class="actions">
      <div class="ui fields grid">
        <div class="field eight wide column" style="text-align: left">
          <select id="template">
            <option value="save">Save As Template</option>
            <option value="default">Apply Default</option>
          </select>
        </div>
        <div class="field eight wide column">
          <div class="ui green ok button">OK</div>
          <div class="ui grey cancel button">Cancel</div>
        </div>
      </div>
    </div>
  </div>`;
}

const maTemaplate = `
  <div class="ui bottom attached tab segment active grid mini-row" data-tab="input_tab">
    <div class="fields row" style="padding: 5px 0">
      <div class="field four wide column label">Length</div>
      <div class="field six wide column">
        <div class="ui fluid input">
          <input class="input-box" type="number" min="0" name="len" key="len"/>
        </div>
      </div>
    </div>
    <div class="fields row" style="padding: 5px 0">
      <div class="field four wide column label">Source</div>
      <div class="field six wide column">
        <div class="ui selection scrolling dropdown" style="min-width: 100% !important" key="source">
          <input type="hidden" name="source"/><i class="dropdown icon"></i>
          <div class="default text"></div>
          <div class="menu">
            <div class="item" data-value="open">Open</div>
            <div class="item" data-value="high">High</div>
            <div class="item" data-value="low">Low</div>
            <div class="item" data-value="close">Close</div>
          </div>
        </div>
      </div>
    </div>
    <div class="fields row" style="padding: 5px 0">
      <div class="field four wide column label">Offset</div>
      <div class="field six wide column">
        <div class="ui fluid input">
          <input class="input-box" type="number" name="offset" key="offset"/>
        </div>
      </div>
    </div>
  </div>
  <div class="ui bottom attached tab segment grid" data-tab="style_tab">
    <div class="fields row">
      <div class="field four wide column label">Plot</div>
      <div class="field three wide column color">
        <input type="text" style="display:none" class="color-wrapper" key="mainLine.lineColor"/>
      </div>
      <div class="field six wide column">
        <div class="ui fluid input">
          <input type="number" min="1" max="4" class="input-box" style="padding-left:5px; padding-right:5px" key="mainLine.lineThickness"/>
        </div>
      </div>
    </div>
  </div>
`;

const ichimokuTemplate = `
  <div class="ui bottom attached tab segment active grid mini-row" data-tab="input_tab">
    <div class="fields row" style="padding: 5px 0">
      <div class="field eight wide column label">Conversion Line Periods</div>
      <div class="field six wide column">
        <div class="ui fluid input">
          <input type="number" min="1" class="input-box" key="conversionPeriod"/>
        </div>
      </div>
    </div>
    <div class="fields row" style="padding: 5px 0">
      <div class="field eight wide column label">Base Line Periods</div>
      <div class="field six wide column">
        <div class="ui fluid input">
          <input type="number" min="1" class="input-box" key="basePeriod"/>
        </div>
      </div>
    </div>
    <div class="fields row" style="padding: 5px 0">
      <div class="field eight wide column label">Lagging Span 2 Periods</div>
      <div class="field six wide column">
        <div class="ui fluid input">
          <input type="number" min="1" class="input-box" key="laggingSpanPeriod"/>
        </div>
      </div>
    </div>
    <div class="fields row" style="padding: 5px 0">
      <div class="field eight wide column label">Displacement</div>
      <div class="field six wide column">
        <div class="ui fluid input">
          <input type="number" min="1" class="input-box" key="displacement"/>
        </div>
      </div>
    </div>
  </div>
  <div class="ui bottom attached tab segment grid" data-tab="style_tab">
    <div class="fields row" style="padding: 5px 0">
      <div class="field one wide column label"> 
        <div class="ui checkbox" key="tenkan.visible">
          <input type="checkbox"/>
          <label></label>
        </div>
      </div>
      <div class="field six wide column label" key="tenkan">Conversion Line</div>
      <div class="field two wide column color">
        <input type="text" style="display:none" class="color-wrapper" key="tenkan.lineColor"/>
      </div>
      <div class="field three wide column">
        <div class="ui selection dropdown" style="min-width: 100% !important" key="tenkan.lineThickness">
          <input type="hidden" name="tenkan.thickness" value=""/><i class="dropdown icon"></i>
          <div class="default text"></div>
          <div class="menu">
            <div class="item" data-value="1">1</div>
            <div class="item" data-value="2">2</div>
            <div class="item" data-value="3">3</div>
            <div class="item" data-value="4">4</div>
          </div>
        </div>
      </div>
    </div>
    <div class="fields row" style="padding: 5px 0">
      <div class="field one wide column label"> 
        <div class="ui checkbox" key="kijun.visible">
          <input type="checkbox"/>
          <label></label>
        </div>
      </div>
      <div class="field six wide column label" key="kijun">Base Line</div>
      <div class="field two wide column color">
        <input type="text" style="display:none" class="color-wrapper" key="kijun.lineColor"/>
      </div>
      <div class="field three wide column">
        <div class="ui selection dropdown" style="min-width: 100% !important" key="kijun.lineThickness">
          <input type="hidden" name="selectedIndicator.kijun.thickness" value=""/><i class="dropdown icon"></i>
          <div class="default text"></div>
          <div class="menu">
            <div class="item" data-value="1">1</div>
            <div class="item" data-value="2">2</div>
            <div class="item" data-value="3">3</div>
            <div class="item" data-value="4">4</div>
          </div>
        </div>
      </div>
    </div>
    <div class="fields row" style="padding: 5px 0">
      <div class="field one wide column label"> 
        <div class="ui checkbox" key="mainLine.visible">
          <input type="checkbox"/>
          <label></label>
        </div>
      </div>
      <div class="field six wide column label" key="chikou">Lagging Span</div>
      <div class="field two wide column color">
        <input type="text" style="display:none" class="color-wrapper" key="mainLine.lineColor"/>
      </div>
      <div class="field three wide column">
        <div class="ui selection dropdown" style="min-width: 100% !important" key="mainLine.lineThickness">
          <input type="hidden" name="mainLine.thickness" value=""/><i class="dropdown icon"></i>
          <div class="default text"></div>
          <div class="menu">
            <div class="item" data-value="1">1</div>
            <div class="item" data-value="2">2</div>
            <div class="item" data-value="3">3</div>
            <div class="item" data-value="4">4</div>
          </div>
        </div>
      </div>
    </div>
    <div class="fields row" style="padding: 5px 0">
      <div class="field one wide column label"> 
        <div class="ui checkbox" key="senkouA.visible">
          <input type="checkbox"/>
          <label></label>
        </div>
      </div>
      <div class="field six wide column label" key="senkoua">Lead1</div>
      <div class="field two wide column color">
        <input type="text" style="display:none" class="color-wrapper" key="senkouA.lineColor"/>
      </div>
      <div class="field three wide column">
        <div class="ui selection dropdown" style="min-width: 100% !important" key="senkouA.lineThickness">
          <input type="hidden" name="selectedIndicator.senkouA.thickness" value=""/><i class="dropdown icon"></i>
          <div class="default text"></div>
          <div class="menu">
            <div class="item" data-value="1">1</div>
            <div class="item" data-value="2">2</div>
            <div class="item" data-value="3">3</div>
            <div class="item" data-value="4">4</div>
          </div>
        </div>
      </div>
    </div>
    <div class="fields row" style="padding: 5px 0">
      <div class="field one wide column label"> 
        <div class="ui checkbox" key="senkouB.visible">
          <input type="checkbox"/>
          <label></label>
        </div>
      </div>
      <div class="field six wide column label" key="senkoub">Lead2</div>
      <div class="field two wide column color">
        <input type="text" style="display:none" class="color-wrapper" key="senkouB.lineColor"/>
      </div>
      <div class="field three wide column">
        <div class="ui selection dropdown scrolling" style="min-width: 100% !important" key="senkouB.lineThickness">
          <input type="hidden" name="selectedIndicator.senkouB.thickness" value=""/><i class="dropdown icon"></i>
          <div class="default text"></div>
          <div class="menu">
            <div class="item" data-value="1">1</div>
            <div class="item" data-value="2">2</div>
            <div class="item" data-value="3">3</div>
            <div class="item" data-value="4">4    </div>
          </div>
        </div>
      </div>
    </div>
    <div class="fields row" style="padding: 5px 0">
      <div class="field one wide column label"> 
        <div class="ui checkbox" key="lagging.visible">
          <input type="checkbox"/>
          <label></label>
        </div>
      </div>
      <div class="field six wide column label">Plots Background</div>
      <div class="field two wide column color">
        <input type="text" style="display:none" class="color-wrapper" key="lagging.color"/>
      </div>
    </div>
  </div>
`;

const macdTemplate = `
  <div class="ui bottom attached tab segment active grid mini-row" data-tab="input_tab">
    <div class="fields row" style="padding: 5px 0">
      <div class="field seven wide column label">Fast Length</div>
      <div class="field six wide column">
        <div class="ui fluid input">
          <input class="input-box" type="number" min="0" key="fast_length"/>
        </div>
      </div>
    </div>
    <div class="fields row" style="padding: 5px 0">
      <div class="field seven wide column label">Slow Length</div>
      <div class="field six wide column">
        <div class="ui fluid input">
          <input class="input-box" type="number" min="0" key="slow_length"/>
        </div>
      </div>
    </div>
    <div class="fields row" style="padding: 5px 0">
      <div class="field seven wide column label">Source</div>
      <div class="field six wide column">
        <div class="ui selection dropdown" style="min-width: 100% !important" key="source">
          <input type="hidden" name="source" value=""/><i class="dropdown icon"></i>
          <div class="default text"></div>
          <div class="menu">
            <div class="item" data-value="open">Open</div>
            <div class="item" data-value="high">High</div>
            <div class="item" data-value="log">Low</div>
            <div class="item" data-value="close">Close</div>
          </div>
        </div>
      </div>
    </div>
    <div class="fields row" style="padding: 5px 0">
      <div class="field seven wide column label">Signal Smoothing</div>
      <div class="field six wide column">
        <div class="ui fluid input">
          <input class="input-box" type="number" min="0" max="50" key="signal_length"/>
        </div>
      </div>
    </div>
    <div class="fields row" style="padding: 5px 0">
      <div class="field one wide column label"> 
        <div class="ui checkbox" key="sma_source">
          <input type="checkbox"/>
          <label> </label>
        </div>
      </div>
      <div class="field eight wide column label">Simple MA(Oscillator)</div>
    </div>
    <div class="fields row" style="padding: 5px 0">
      <div class="field one wide column label"> 
        <div class="ui checkbox" key="sma_signal">
          <input type="checkbox"/>
          <label> </label>
        </div>
      </div>
      <div class="field eight wide column label">Simple MA(Signal Line)</div>
    </div>
  </div>
  <div class="ui bottom attached tab segment grid" data-tab="style_tab">
    <div class="fields row" style="padding: 5px 0">
      <div class="field one wide column label"> 
        <div class="ui checkbox" key="histogram.visible">
          <input type="checkbox"/>
          <label></label>
        </div>
      </div>
      <div class="field four wide column label">Histogram</div>
    </div>
    <div class="fields row" style="padding: 5px 0">
      <div class="field one wide column"></div>
      <div class="field four wide column label">Color 0</div>
      <div class="field three wide column color">
        <input type="text" style="display:none" class="color-wrapper" key="histogram.color[0]"/>
      </div>
    </div>
    <div class="fields row" style="padding: 5px 0">
      <div class="field one wide column"></div>
      <div class="field four wide column label">Color 1</div>
      <div class="field three wide column color">
        <input type="text" style="display:none" class="color-wrapper" key="histogram.color[1]"/>
      </div>
    </div>
    <div class="fields row" style="padding: 5px 0">
      <div class="field one wide column"></div>
      <div class="field four wide column label">Color 2</div>
      <div class="field three wide column color">
        <input type="text" style="display:none" class="color-wrapper" key="histogram.color[2]"/>
      </div>
    </div>
    <div class="fields row" style="padding: 5px 0">
      <div class="field one wide column"></div>
      <div class="field four wide column label">Color 3</div>
      <div class="field three wide column color">
        <input type="text" style="display:none" class="color-wrapper" key="histogram.color[3]"/>
      </div>
    </div>
    <div class="fields row" style="padding: 5px 0">
      <div class="field one wide column label"> 
        <div class="ui checkbox" key="macd.visible">
          <input type="checkbox"/>
          <label></label>
        </div>
      </div>
      <div class="field four wide column label">MACD</div>
      <div class="field three wide column color">
        <input type="text" style="display:none" class="color-wrapper" key="macd.color"/>
      </div>
      <div class="field four wide column">
        <div class="ui selection dropdown" style="min-width: 100% !important" key="macd.lineThickness">
          <input type="hidden" name="macd.thickness" value=""/><i class="dropdown icon"></i>
          <div class="default text"></div>
          <div class="menu">
            <div class="item" data-value="1">1</div>
            <div class="item" data-value="2">2</div>
            <div class="item" data-value="3">3</div>
            <div class="item" data-value="4">4</div>
          </div>
        </div>
      </div>
    </div>
    <div class="fields row" style="padding: 5px 0">
      <div class="field one wide column label"> 
        <div class="ui checkbox" key="signal.visible">
          <input type="checkbox"/>
          <label></label>
        </div>
      </div>
      <div class="field four wide column label">Signal</div>
      <div class="field three wide column color">
        <input type="text" style="display:none" class="color-wrapper" key="signal.color"/>
      </div>
      <div class="field four wide column">
        <div class="ui selection dropdown" style="min-width: 100% !important" key="signal.lineThickness">
          <input type="hidden" name="signal.lineThickness" value="{{}}"/><i class="dropdown icon"></i>
          <div class="default text"></div>
          <div class="menu">
            <div class="item" data-value="1">1</div>
            <div class="item" data-value="2">2</div>
            <div class="item" data-value="3">3</div>
            <div class="item" data-value="4">4</div>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

const stochastic = `
  <div class="ui bottom attached tab segment active grid" data-tab="input_tab">
    <div class="fields row" style="padding: 5px 0">
      <div class="field four wide column label">K</div>
      <div class="field six wide column">
        <div class="ui fluid input">
          <input type="number" min="1" name="k_period" key="kPeriod" class="input-box"/>
        </div>
      </div>
    </div>
    <div class="fields row" style="padding: 5px 0">
      <div class="field four wide column label">D Periods</div>
      <div class="field six wide column">
        <div class="ui fluid input">
          <input type="number" min="1" name="d_period" key="dPeriod" class="input-box"/>
        </div>
      </div>
    </div>
    <div class="fields row" style="padding: 5px 0">
      <div class="field four wide column label">Smooth</div>
      <div class="field six wide column">
        <div class="ui fluid input">
          <input type="number" min="1" name="smooth" key="smooth" class="input-box"/>
        </div>
      </div>
    </div>
  </div>
  <div class="ui bottom attached tab segment grid" data-tab="style_tab">
    <div class="fields row" style="padding: 5px 0">
      <div class="field one wide column label"> 
        <div class="ui checkbox" key="kLine.visible">
          <input type="checkbox"/>
          <label></label>
        </div>
      </div>
      <div class="field six wide column label">%K</div>
      <div class="field three wide column color">
        <input type="text" style="display:none" class="color-wrapper" key="kLine.lineColor"/>
      </div>
      <div class="field three wide column">
        <div class="ui selection dropdown" style="min-width: 100% !important" key="kLine.lineThickness">
          <input type="hidden" name="kLine.thickness" value=""/><i class="dropdown icon"></i>
          <div class="default text"></div>
          <div class="menu">
            <div class="item" data-value="1">1</div>
            <div class="item" data-value="2">2</div>
            <div class="item" data-value="3">3</div>
            <div class="item" data-value="4">4</div>
          </div>
        </div>
      </div>
    </div>
    <div class="fields row" style="padding: 5px 0">
      <div class="field one wide column label"> 
        <div class="ui checkbox" key="dLine.visible">
          <input type="checkbox"/>
          <label></label>
        </div>
      </div>
      <div class="field six wide column label">%D</div>
      <div class="field three wide column color">
        <input type="text" style="display:none" class="color-wrapper" key="dLine.lineColor"/>
      </div>
      <div class="field three wide column">
        <div class="ui selection dropdown" style="min-width: 100% !important" key="dLine.lineThickness">
          <input type="hidden" name="dLine.thickness" value=""/><i class="dropdown icon"></i>
          <div class="default text"></div>
          <div class="menu">
            <div class="item" data-value="1">1</div>
            <div class="item" data-value="2">2</div>
            <div class="item" data-value="3">3</div>
            <div class="item" data-value="4">4</div>
          </div>
        </div>
      </div>
    </div>
    <div class="fields row" style="padding: 5px 0">
      <div class="field one wide column label"> 
        <div class="ui checkbox" key="upperBand.visible">
          <input type="checkbox"/>
          <label></label>
        </div>
      </div>
      <div class="field six wide column label">Upper Band</div>
      <div class="field three wide column color">
        <input type="text" style="display:none" class="color-wrapper" key="upperBand.lineColor"/>
      </div>
      <div class="field three wide column">
        <div class="ui selection dropdown" style="min-width: 100% !important" key="upperBand.lineThickness">
          <input type="hidden" name="upperBand.thickness" value=""/><i class="dropdown icon"></i>
          <div class="default text"></div>
          <div class="menu">
            <div class="item" data-value="1">1</div>
            <div class="item" data-value="2">2</div>
            <div class="item" data-value="3">3</div>
            <div class="item" data-value="4">4</div>
          </div>
        </div>
      </div>
    </div>
    <div class="fields row" style="padding: 5px 0">
      <div class="field one wide column label"> 
        <div class="ui checkbox" key="lowBand.visible">
          <input type="checkbox"/>
          <label></label>
        </div>
      </div>
      <div class="field six wide column label">Low Band</div>
      <div class="field three wide column color">
        <input type="text" style="display:none" class="color-wrapper" key="lowBand.lineColor"/>
      </div>
      <div class="field three wide column">
        <div class="ui selection dropdown" style="min-width: 100% !important" key="lowBand.lineThickness">
          <input type="hidden" name="lowBand.thickness" value=""/><i class="dropdown icon"></i>
          <div class="default text"></div>
          <div class="menu">
            <div class="item" data-value="1">1</div>
            <div class="item" data-value="2">2</div>
            <div class="item" data-value="3">3</div>
            <div class="item" data-value="4">4</div>
          </div>
        </div>
      </div>
    </div>
    <div class="fields row" style="padding: 5px 0">
      <div class="field one wide column label"> 
        <div class="ui checkbox" key="lagging.visible">
          <input type="checkbox"/>
          <label></label>
        </div>
      </div>
      <div class="field six wide column label">Background</div>
      <div class="field three wide column color">
        <input type="text" style="display:none" class="color-wrapper" key="lagging.color"/>
      </div>
    </div>
  </div>
`;

const rsiTemplate = `
  <div class="ui bottom attached tab segment active grid" data-tab="input_tab">
    <div class="fields row" style="padding: 5px 0">
      <div class="field four wide column label">Length</div>
      <div class="field six wide column">
        <div class="ui fluid input">
          <input class="input-box" type="number" min="1" key="len"/>
        </div>
      </div>
    </div>
    <div class="fields row" style="padding: 5px 0">
      <div class="field four wide column label">Source</div>
      <div class="field five wide column">
        <div class="ui selection dropdown" style="min-width: 100% !important" key="source">
          <input type="hidden" name="selectedIndicator.source" value=""/><i class="dropdown icon"></i>
          <div class="default text"></div>
          <div class="menu">
            <div class="item" data-value="open">Open</div>
            <div class="item" data-value="high">High</div>
            <div class="item" data-value="low">Low</div>
            <div class="item" data-value="close">Close</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="ui bottom attached tab segment grid" data-tab="style_tab">
    <div class="fields row" style="padding: 5px 0">
      <div class="field one wide column label"> 
        <div class="ui checkbox" key="rsi.visible">
          <input type="checkbox"/>
          <label></label>
        </div>
      </div>
      <div class="field four wide column label">RSI</div>
      <div class="field three wide column color">
        <input type="text" style="display:none" class="color-wrapper" key="rsi.lineColor"/>
      </div>
      <div class="field three wide column">
        <div class="ui selection dropdown" style="min-width: 100% !important" key="rsi.lineThickness">
          <input type="hidden" name="selectedIndicator.rsi.thickness" value=""/><i class="dropdown icon"></i>
          <div class="default text"></div>
          <div class="menu">
            <div class="item" data-value="1">1</div>
            <div class="item" data-value="2">2</div>
            <div class="item" data-value="3">3</div>
            <div class="item" data-value="4">4</div>
          </div>
        </div>
      </div>
    </div>
    <div class="fields row" style="padding: 5px 0">
      <div class="field one wide column label"> 
        <div class="ui checkbox" key="upperBand.visible">
          <input type="checkbox"/>
          <label></label>
        </div>
      </div>
      <div class="field four wide column label">Upper Band</div>
      <div class="field three wide column color">
        <input type="text" style="display:none" class="color-wrapper" key="upperBand.lineColor"/>
      </div>
      <div class="field three wide column">
        <div class="ui selection dropdown" style="min-width: 100% !important" key="upperBand.lineThickness">
          <input type="hidden" name="selectedIndicator.upperBand.thickness" value=""/><i class="dropdown icon"></i>
          <div class="default text"></div>
          <div class="menu">
            <div class="item" data-value="1">1</div>
            <div class="item" data-value="2">2</div>
            <div class="item" data-value="3">3</div>
            <div class="item" data-value="4">4</div>
          </div>
        </div>
      </div>
      <div class="field four wide column">
        <div class="ui selection dropdown" key="upperBand.lineDashType">
          <input type="hidden" name="lineStyle" value=""/><i class="dropdown icon"></i>
          <div class="default text">
            <div class="tv-line-style-option solid"></div>
          </div>
          <div class="menu">
            <div class="item" data-value="solid">
              <div class="tv-line-style-option solid"></div>
            </div>
            <div class="item" data-value="dot">
              <div class="tv-line-style-option dot"></div>
            </div>
            <div class="item" data-value="dash">
              <div class="tv-line-style-option dash"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="fields row" style="padding: 5px 0">
      <div class="field one wide column label"> 
        <div class="ui checkbox" key="lowBand.visible">
          <input type="checkbox"/>
          <label></label>
        </div>
      </div>
      <div class="field four wide column label">Lower Band</div>
      <div class="field three wide column color">
        <input type="text" style="display:none" class="color-wrapper" key="lowBand.lineColor"/>
      </div>
      <div class="field three wide column">
        <div class="ui selection dropdown" style="min-width: 100% !important" key="lowBand.lineThickness">
          <input type="hidden" name="selectedIndicator.lowBand.thickness" value=""/><i class="dropdown icon"></i>
          <div class="default text"></div>
          <div class="menu">
            <div class="item" data-value="1">1</div>
            <div class="item" data-value="2">2</div>
            <div class="item" data-value="3">3</div>
            <div class="item" data-value="4">4</div>
          </div>
        </div>
      </div>
      <div class="field four wide column">
        <div class="ui selection dropdown" key="lowBand.lineDashType">
          <input type="hidden" name="lineStyle" value=""/><i class="dropdown icon"></i>
          <div class="default text">
            <div class="tv-line-style-option solid"></div>
          </div>
          <div class="menu">
            <div class="item" data-value="solid">
              <div class="tv-line-style-option solid"></div>
            </div>
            <div class="item" data-value="dot">
              <div class="tv-line-style-option dot"></div>
            </div>
            <div class="item" data-value="dash">
              <div class="tv-line-style-option dash"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="fields row" style="padding: 5px 0">
      <div class="field one wide column label"> 
        <div class="ui checkbox" key="lagging.visible">
          <input type="checkbox"/>
          <label></label>
        </div>
      </div>
      <div class="field four wide column label">Background</div>
      <div class="field three wide column color">
        <input type="text" style="display:none" class="color-wrapper" key="lagging.color"/>
      </div>      
    </div>
  </div>
`;

const atrTemplate = `
  <div class="ui bottom attached tab segment active grid" data-tab="input_tab">
    <div class="fields row" style="padding: 5px 0">
      <div class="field four wide column label">Length</div>
      <div class="field six wide column">
        <div class="ui fluid input">
          <input class="input-box" type="number" min="1" key="len"/>
        </div>
      </div>
    </div>    
  </div>
  <div class="ui bottom attached tab segment grid" data-tab="style_tab">
    <div class="fields row" style="padding: 5px 0">
      <div class="field one wide column label"> 
        <div class="ui checkbox" key="signal.visible">
          <input type="checkbox"/>
          <label></label>
        </div>
      </div>
      <div class="field four wide column label">ATR</div>
      <div class="field three wide column color">
        <input type="text" style="display:none" class="color-wrapper" key="signal.color"/>
      </div>
      <div class="field three wide column">
        <div class="ui selection dropdown" style="min-width: 100% !important" key="signal.lineThickness">
          <input type="hidden" name="selectedIndicator.signal.thickness" value=""/><i class="dropdown icon"></i>
          <div class="default text"></div>
          <div class="menu">
            <div class="item" data-value="1">1</div>
            <div class="item" data-value="2">2</div>
            <div class="item" data-value="3">3</div>
            <div class="item" data-value="4">4</div>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

const indicatorTemplates = {
  'ma': maTemaplate,
  'ichimoku': ichimokuTemplate,
  'macd': macdTemplate,
  'stochastic': stochastic,
  'rsi': rsiTemplate,
  'atr': atrTemplate
};

export function getIndicatorTemplates (key) {
  return `
  <div class="setting-modal tfa-modal" style="padding: 10px">
    <div class="content" style="padding-top: 0px">
      <div class="ui top attached tabular menu">
        <a class="item active" data-tab="input_tab">Inputs</a>
        <a class="item" data-tab="style_tab">Style</a>
      </div>
      ${indicatorTemplates[key]}
    </div>
    <div class="actions">
      <div class="ui fields grid">
        <div class="field eight wide column" style="text-align: left">
          <select id="template">
            <option value="default">Reset Setting</option>
            <option value="save">Save as default</option>
          </select>
        </div>
        <div class="field eight wide column">
          <div class="ui green ok button">OK</div>
          <div class="ui grey cancel button">Cancel</div>
        </div>
      </div>
    </div>
  </div>`;
}

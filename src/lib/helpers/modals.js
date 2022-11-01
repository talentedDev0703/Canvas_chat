const SYMBOL_MODAL_TEMPLATE = `
    <div class="chart-symbol-modal">
        <div class="content scrolling down">
            <div class="title">
                <h2>Symbol Search</h2>
                <div class="ui label close">
                    <svg width="15" height="15" class="close" viewBox="0 0 15 15"  fill="#FCFCFC" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.00029 0.317885L7.50014 5.8172L13 0.334549C13.1083 0.224379 13.2382 0.137874 13.3817 0.0805049C13.5251 0.0231361 13.6789 -0.0038486 13.8333 0.00125733C14.1363 0.0208622 14.4218 0.150057 14.6364 0.364719C14.8511 0.579381 14.9803 0.864834 14.9999 1.16778C15.0014 1.31673 14.9727 1.46444 14.9154 1.60194C14.8581 1.73944 14.7734 1.86387 14.6666 1.96768L9.15009 7.50032L14.6666 13.033C14.8833 13.2429 15.0033 13.5329 14.9999 13.8329C14.9803 14.1358 14.8511 14.4213 14.6364 14.6359C14.4218 14.8506 14.1363 14.9798 13.8333 14.9994C13.6789 15.0045 13.5251 14.9775 13.3817 14.9201C13.2382 14.8628 13.1083 14.7763 13 14.6661L7.50014 9.18345L2.01695 14.6661C1.90867 14.7763 1.7787 14.8628 1.63526 14.9201C1.49182 14.9775 1.33804 15.0045 1.18364 14.9994C0.875017 14.9833 0.583284 14.8535 0.364758 14.635C0.146231 14.4165 0.0164056 14.1248 0.00034112 13.8162C-0.00116684 13.6673 0.0276004 13.5195 0.0848979 13.382C0.142195 13.2445 0.226829 13.1201 0.333665 13.0163L5.85018 7.50032L0.316999 1.96768C0.213171 1.86247 0.131618 1.73741 0.0772107 1.59997C0.0228039 1.46253 -0.00333999 1.31554 0.00034112 1.16778C0.0199479 0.864834 0.149156 0.579381 0.363839 0.364719C0.578521 0.150057 0.864002 0.0208622 1.16698 0.00125733C1.32018 -0.00601838 1.47323 0.0183407 1.6166 0.0728159C1.75997 0.127291 1.89058 0.210715 2.00029 0.317885Z" fill-opacity="0.8"/>
                    </svg>
                </div>
            </div>
            <div class="header">
                <div class="ui left icon input" style="width: 90%"><i class="icon search"> </i>
                    <input type="text" id="search_key"/>
                </div>
                
            </div>
            <div class="sub-header">
                <div class="ui left floated compact segment channel-enable">
                    <div style="margin: 6px;" class="title">#USD Chatroom</div>
                    <div class="ui fitted toggle checkbox">
                        <input type="checkbox">
                        <label></label>
                    </div>
                </div>
            </div>
            <div class="scrolling-content">	
                <div class="ui active dimmer">
                    <div class="ui loader"></div>
                    <div class="content">
                        <div class="confirm-popup">
                            Do you really want to delete chart layout \"<span id="chart_name"></span>\"?
                            <div class="actions">
                                <div class="ui button cancel" key="cancel">No</div>
                                <div class="ui button ok" key="ok">Yes</div>
                            </div>
                        </div>
                    </div>
                </div>							
                <div class="ui list layout-contents">
                    
                </div>
            </div>
        </div>
    </div>`;

const INDICATOR_MODAL_TEMPLATE = `
    <div class="indicators indicator-modal">
        <div class="scrolling content mini-title">
            <div class="title">
                <h2>Indicators</h2>
                <div class="ui label close">
                    <svg width="15" height="15" class="close" viewBox="0 0 15 15"  fill="#FCFCFC" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.00029 0.317885L7.50014 5.8172L13 0.334549C13.1083 0.224379 13.2382 0.137874 13.3817 0.0805049C13.5251 0.0231361 13.6789 -0.0038486 13.8333 0.00125733C14.1363 0.0208622 14.4218 0.150057 14.6364 0.364719C14.8511 0.579381 14.9803 0.864834 14.9999 1.16778C15.0014 1.31673 14.9727 1.46444 14.9154 1.60194C14.8581 1.73944 14.7734 1.86387 14.6666 1.96768L9.15009 7.50032L14.6666 13.033C14.8833 13.2429 15.0033 13.5329 14.9999 13.8329C14.9803 14.1358 14.8511 14.4213 14.6364 14.6359C14.4218 14.8506 14.1363 14.9798 13.8333 14.9994C13.6789 15.0045 13.5251 14.9775 13.3817 14.9201C13.2382 14.8628 13.1083 14.7763 13 14.6661L7.50014 9.18345L2.01695 14.6661C1.90867 14.7763 1.7787 14.8628 1.63526 14.9201C1.49182 14.9775 1.33804 15.0045 1.18364 14.9994C0.875017 14.9833 0.583284 14.8535 0.364758 14.635C0.146231 14.4165 0.0164056 14.1248 0.00034112 13.8162C-0.00116684 13.6673 0.0276004 13.5195 0.0848979 13.382C0.142195 13.2445 0.226829 13.1201 0.333665 13.0163L5.85018 7.50032L0.316999 1.96768C0.213171 1.86247 0.131618 1.73741 0.0772107 1.59997C0.0228039 1.46253 -0.00333999 1.31554 0.00034112 1.16778C0.0199479 0.864834 0.149156 0.579381 0.363839 0.364719C0.578521 0.150057 0.864002 0.0208622 1.16698 0.00125733C1.32018 -0.00601838 1.47323 0.0183407 1.6166 0.0728159C1.75997 0.127291 1.89058 0.210715 2.00029 0.317885Z" fill-opacity="0.8"/>
                    </svg>
                </div>
            </div>
            <div class="header">
                <div class="ui left icon input" style="width: 90%"><i class="icon search"> </i>
                    <input type="text" id="search_key"/>
                </div>
                
            </div>
            <div class="scrolling-content">	
                <div class="ui indicator-lists list selection aligned"></div>				
            </div>
        </div>
    </div>`;

const SETTING_MODAL_TEMPLATE = `
    <div class="modal-body setting-modal">
        <div class="scrolling content">
            <div class="title">
                <h2>Chart Settings</h2>
                <div class="ui label close">
                    <svg width="15" height="15" class="close" viewBox="0 0 15 15"  fill="#FCFCFC" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.00029 0.317885L7.50014 5.8172L13 0.334549C13.1083 0.224379 13.2382 0.137874 13.3817 0.0805049C13.5251 0.0231361 13.6789 -0.0038486 13.8333 0.00125733C14.1363 0.0208622 14.4218 0.150057 14.6364 0.364719C14.8511 0.579381 14.9803 0.864834 14.9999 1.16778C15.0014 1.31673 14.9727 1.46444 14.9154 1.60194C14.8581 1.73944 14.7734 1.86387 14.6666 1.96768L9.15009 7.50032L14.6666 13.033C14.8833 13.2429 15.0033 13.5329 14.9999 13.8329C14.9803 14.1358 14.8511 14.4213 14.6364 14.6359C14.4218 14.8506 14.1363 14.9798 13.8333 14.9994C13.6789 15.0045 13.5251 14.9775 13.3817 14.9201C13.2382 14.8628 13.1083 14.7763 13 14.6661L7.50014 9.18345L2.01695 14.6661C1.90867 14.7763 1.7787 14.8628 1.63526 14.9201C1.49182 14.9775 1.33804 15.0045 1.18364 14.9994C0.875017 14.9833 0.583284 14.8535 0.364758 14.635C0.146231 14.4165 0.0164056 14.1248 0.00034112 13.8162C-0.00116684 13.6673 0.0276004 13.5195 0.0848979 13.382C0.142195 13.2445 0.226829 13.1201 0.333665 13.0163L5.85018 7.50032L0.316999 1.96768C0.213171 1.86247 0.131618 1.73741 0.0772107 1.59997C0.0228039 1.46253 -0.00333999 1.31554 0.00034112 1.16778C0.0199479 0.864834 0.149156 0.579381 0.363839 0.364719C0.578521 0.150057 0.864002 0.0208622 1.16698 0.00125733C1.32018 -0.00601838 1.47323 0.0183407 1.6166 0.0728159C1.75997 0.127291 1.89058 0.210715 2.00029 0.317885Z" fill-opacity="0.8"/>
                    </svg>
                </div>
            </div>
            <div class="ui grid">
                <div class="two column row">
                    <div class="column label">Dark Theme</div>
                    <div class="column action">
                        <div class="ui fitted toggle checkbox" key="theme"><input type="checkbox"><label></label></div>
                    </div>
                </div>
                <div class="ui horizontal divider"></div>
                <div class="two column row">
                    <div class="column label">Chart Type</div>
                    <div class="column action">
                        <div class="ui label chart-type" key="candle">
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="#1B1C1D" xmlns="http://www.w3.org/2000/svg">
                                <path d="M27.75 24.75H6.25V5.25C6.25 5.1125 6.1375 5 6 5H4.25C4.1125 5 4 5.1125 4 5.25V26.75C4 26.8875 4.1125 27 4.25 27H27.75C27.8875 27 28 26.8875 28 26.75V25C28 24.8625 27.8875 24.75 27.75 24.75Z"/>
                                <path d="M20.8751 5H19.2917V8.95833H20.8751V5Z"/>
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M16.9167 8.9585H23.2501V20.0418H20.8751V22.5H19.2917V20.0418H16.9167V8.9585ZM18.9167 10.9585H21.2501V18.0418H18.9167V10.9585Z"/>
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M9 12.9165H11.375V9.75H12.9583V12.9165H15.3333V20.0415H12.9583V22.5H11.375V20.0415H9V12.9165ZM11 14.9165H13.3333V18.0415H11V14.9165Z"/>
                            </svg>
                            <div class="title">Candle</div>
                        </div>
                        <div class="ui label chart-type" key="line">
                            <svg width="24" height="22" style="margin-top: 5px;" viewBox="0 0 24 22" fill="#1B1C1D" xmlns="http://www.w3.org/2000/svg">
                                <path d="M23.75 19.75H2.25V0.25C2.25 0.1125 2.1375 0 2 0H0.25C0.1125 0 0 0.1125 0 0.25V21.75C0 21.8875 0.1125 22 0.25 22H23.75C23.8875 22 24 21.8875 24 21.75V20C24 19.8625 23.8875 19.75 23.75 19.75ZM5.55625 14.9281C5.65312 15.025 5.80938 15.025 5.90938 14.9281L10.2312 10.6281L14.2188 14.6406C14.3156 14.7375 14.475 14.7375 14.5719 14.6406L23.1781 6.0375C23.275 5.94063 23.275 5.78125 23.1781 5.68437L21.9406 4.44687C21.8936 4.40035 21.8302 4.37425 21.7641 4.37425C21.6979 4.37425 21.6345 4.40035 21.5875 4.44687L14.4 11.6313L10.4187 7.625C10.3718 7.57847 10.3083 7.55237 10.2422 7.55237C10.1761 7.55237 10.1126 7.57847 10.0656 7.625L4.32187 13.3344C4.27535 13.3814 4.24925 13.4448 4.24925 13.5109C4.24925 13.5771 4.27535 13.6405 4.32187 13.6875L5.55625 14.9281Z" fill-opacity="0.4"/>
                            </svg>
                            <div class="title">Line</div>
                        </div>
                        <div class="ui label chart-type" key="heiken">
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="#1B1C1D" xmlns="http://www.w3.org/2000/svg">
                                <path d="M27.75 24.75H6.25V5.25C6.25 5.1125 6.1375 5 6 5H4.25C4.1125 5 4 5.1125 4 5.25V26.75C4 26.8875 4.1125 27 4.25 27H27.75C27.8875 27 28 26.8875 28 26.75V25C28 24.8625 27.8875 24.75 27.75 24.75Z" fill="#1B1C1D" fill-opacity="0.4"/>
                                <rect x="10" y="16.9165" width="4.33333" height="5.125" stroke="#1B1C1D" stroke-opacity="0.4" stroke-width="2"/>
                                <rect x="17.9167" y="12.9585" width="4.33333" height="9.08333" stroke="#1B1C1D" stroke-opacity="0.4" stroke-width="2"/>
                                <rect x="11.375" y="12.75" width="1.58333" height="3.16667" fill="#1B1C1D" fill-opacity="0.4"/>
                                <rect x="19.2917" y="8" width="1.58333" height="3.95833" fill="#1B1C1D" fill-opacity="0.4"/>
                            </svg>
                            <div class="title">Heiken Ashi</div>
                        </div>
                    </div>
                </div>
                <div class="ui horizontal divider"></div>
                <div class="two column row">
                    <div class="column label">Colors</div>
                    <div class="column action"></div>
                    <div class="column label child">Background Color</div>
                    <div class="column action">
                        <div class="color-container">
                            <input type="text" style="display:none" class="color-wrapper" key="backgroundColor"/>
                        </div>
                    </div>
                    <div class="column label child">Wicks</div>
                    <div class="column action">
                        <div class="color-container">
                            <div class="title">RISING</div>
                            <input type="text" style="display:none" class="color-wrapper" key="wick.rising"/>
                        </div>
                        <div class="color-container">
                            <div class="title">FALLING</div>
                            <input type="text" style="display:none" class="color-wrapper" key="wick.falling"/>
                        </div>
                    </div>
                    <div class="column label child">Body</div>
                    <div class="column action">
                        <div class="color-container">
                            <div class="title">RISING</div>
                            <input type="text" style="display:none" class="color-wrapper" key="wick.rising"/>
                        </div>
                        <div class="color-container">
                            <div class="title">FALLING</div>
                            <input type="text" style="display:none" class="color-wrapper" key="wick.falling"/>
                        </div>
                    </div>
                    <div class="column label child">Line</div>
                    <div class="column action">
                        <div class="color-container">
                            <input type="text" style="display:none" class="color-wrapper" key="color"/>
                        </div>
                    </div>
                </div>
                <div class="ui horizontal divider"></div>
                <div class="two column row">
                    <div class="column label">
                        <div class="ui label default">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 6C4.05225 3.78 6.34725 2.25 9 2.25C9.88642 2.25 10.7642 2.42459 11.5831 2.76381C12.4021 3.10303 13.1462 3.60023 13.773 4.22703C14.3998 4.85382 14.897 5.59794 15.2362 6.41689C15.5754 7.23583 15.75 8.11358 15.75 9C15.75 9.88642 15.5754 10.7642 15.2362 11.5831C14.897 12.4021 14.3998 13.1462 13.773 13.773C13.1462 14.3998 12.4021 14.897 11.5831 15.2362C10.7642 15.5754 9.88642 15.75 9 15.75C7.20979 15.75 5.4929 15.0388 4.22703 13.773C2.96116 12.5071 2.25 10.7902 2.25 9M2.25 2.25V6.75H6.75" stroke="white" stroke-width="2"/>
                            </svg>
                            <div class="title">DEFAULT</div>
                        </div>
                    </div>
                    <div class="column action">
                        <div class="ui label action cancel">Cancel</div>
                        <div class="ui label action ok">Save</div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

const LAYOUT_MODAL_TEMPLATE = `
    <div class="chart-layouts-modal">
        <div class="content scrolling down">
            <div class="title">
                <h2>Load Layout</h2>
                <div class="ui label close">
                    <svg width="15" height="15" class="close" viewBox="0 0 15 15"  fill="#FCFCFC" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.00029 0.317885L7.50014 5.8172L13 0.334549C13.1083 0.224379 13.2382 0.137874 13.3817 0.0805049C13.5251 0.0231361 13.6789 -0.0038486 13.8333 0.00125733C14.1363 0.0208622 14.4218 0.150057 14.6364 0.364719C14.8511 0.579381 14.9803 0.864834 14.9999 1.16778C15.0014 1.31673 14.9727 1.46444 14.9154 1.60194C14.8581 1.73944 14.7734 1.86387 14.6666 1.96768L9.15009 7.50032L14.6666 13.033C14.8833 13.2429 15.0033 13.5329 14.9999 13.8329C14.9803 14.1358 14.8511 14.4213 14.6364 14.6359C14.4218 14.8506 14.1363 14.9798 13.8333 14.9994C13.6789 15.0045 13.5251 14.9775 13.3817 14.9201C13.2382 14.8628 13.1083 14.7763 13 14.6661L7.50014 9.18345L2.01695 14.6661C1.90867 14.7763 1.7787 14.8628 1.63526 14.9201C1.49182 14.9775 1.33804 15.0045 1.18364 14.9994C0.875017 14.9833 0.583284 14.8535 0.364758 14.635C0.146231 14.4165 0.0164056 14.1248 0.00034112 13.8162C-0.00116684 13.6673 0.0276004 13.5195 0.0848979 13.382C0.142195 13.2445 0.226829 13.1201 0.333665 13.0163L5.85018 7.50032L0.316999 1.96768C0.213171 1.86247 0.131618 1.73741 0.0772107 1.59997C0.0228039 1.46253 -0.00333999 1.31554 0.00034112 1.16778C0.0199479 0.864834 0.149156 0.579381 0.363839 0.364719C0.578521 0.150057 0.864002 0.0208622 1.16698 0.00125733C1.32018 -0.00601838 1.47323 0.0183407 1.6166 0.0728159C1.75997 0.127291 1.89058 0.210715 2.00029 0.317885Z" fill-opacity="0.8"/>
                    </svg>
                </div>
            </div>
            <div class="header">
                <div class="ui left icon input" style="width: 90%"><i class="icon search"> </i>
                    <input type="text" id="search_key"/>
                </div>
            </div>
            <div class="sub-header">
                LAYOUT DETAILS
                <div class="ui label icon order">
                    <div class="title">DATE CREATED</div>
                    <i class="icon down angle"></i>
                </div>
            </div>
            <div class="scrolling-content">	
                <div class="ui active dimmer">
                    <div class="ui loader"></div>
                    <div class="content">
                        <div class="confirm-popup">
                            Do you really want to delete chart layout \"<span id="chart_name"></span>\"?
                            <div class="actions">
                                <div class="ui button cancel" key="cancel">No</div>
                                <div class="ui button ok" key="ok">Yes</div>
                            </div>
                        </div>
                    </div>
                </div>							
                <div class="ui list layout-contents">
                    
                </div>
            </div>
        </div>
    </div>`;

const SHARE_MODAL_TEMPLATE = `
    <div class="modal-body share-modal">
        <div class="scrolling content">
            <div class="title">
                <h2>Share GhostRider_AUDUSD</h2>
                <div class="ui label close">
                    <svg width="15" height="15" class="close" viewBox="0 0 15 15"  fill="#FCFCFC" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.00029 0.317885L7.50014 5.8172L13 0.334549C13.1083 0.224379 13.2382 0.137874 13.3817 0.0805049C13.5251 0.0231361 13.6789 -0.0038486 13.8333 0.00125733C14.1363 0.0208622 14.4218 0.150057 14.6364 0.364719C14.8511 0.579381 14.9803 0.864834 14.9999 1.16778C15.0014 1.31673 14.9727 1.46444 14.9154 1.60194C14.8581 1.73944 14.7734 1.86387 14.6666 1.96768L9.15009 7.50032L14.6666 13.033C14.8833 13.2429 15.0033 13.5329 14.9999 13.8329C14.9803 14.1358 14.8511 14.4213 14.6364 14.6359C14.4218 14.8506 14.1363 14.9798 13.8333 14.9994C13.6789 15.0045 13.5251 14.9775 13.3817 14.9201C13.2382 14.8628 13.1083 14.7763 13 14.6661L7.50014 9.18345L2.01695 14.6661C1.90867 14.7763 1.7787 14.8628 1.63526 14.9201C1.49182 14.9775 1.33804 15.0045 1.18364 14.9994C0.875017 14.9833 0.583284 14.8535 0.364758 14.635C0.146231 14.4165 0.0164056 14.1248 0.00034112 13.8162C-0.00116684 13.6673 0.0276004 13.5195 0.0848979 13.382C0.142195 13.2445 0.226829 13.1201 0.333665 13.0163L5.85018 7.50032L0.316999 1.96768C0.213171 1.86247 0.131618 1.73741 0.0772107 1.59997C0.0228039 1.46253 -0.00333999 1.31554 0.00034112 1.16778C0.0199479 0.864834 0.149156 0.579381 0.363839 0.364719C0.578521 0.150057 0.864002 0.0208622 1.16698 0.00125733C1.32018 -0.00601838 1.47323 0.0183407 1.6166 0.0728159C1.75997 0.127291 1.89058 0.210715 2.00029 0.317885Z" fill-opacity="0.8"/>
                    </svg>
                </div>
            </div>
            <div class="header" style="padding-bottom: 0px;">
                <div class="ui left icon input" style="width: 75%">
                    <input type="text" id="search_key" placeholder="Invite someone..." style="padding: 9px 13px !important;"/>
                </div>
                <div class="ui label invite">
                    Send Invite
                </div>
                <div class="ui label role" key="normal">
                    <div class="title">can view</div>
                    <i class="angle down icon"></i>
                </div>
            </div>
            <div class="sub-header mini-pan" style="border-top: 0px;">
                <span class="link">								
                    <svg width="18" class="lock" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M2.99961 8.80039V6.40039C2.99961 4.80909 3.63175 3.28297 4.75697 2.15775C5.88219 1.03253 7.40831 0.400391 8.99961 0.400391C10.5909 0.400391 12.117 1.03253 13.2423 2.15775C14.3675 3.28297 14.9996 4.80909 14.9996 6.40039V8.80039C15.6361 8.80039 16.2466 9.05325 16.6967 9.50333C17.1468 9.95342 17.3996 10.5639 17.3996 11.2004V17.2004C17.3996 17.8369 17.1468 18.4474 16.6967 18.8974C16.2466 19.3475 15.6361 19.6004 14.9996 19.6004H2.99961C2.36309 19.6004 1.75264 19.3475 1.30255 18.8974C0.852466 18.4474 0.599609 17.8369 0.599609 17.2004V11.2004C0.599609 10.5639 0.852466 9.95342 1.30255 9.50333C1.75264 9.05325 2.36309 8.80039 2.99961 8.80039ZM12.5996 6.40039V8.80039H5.39961V6.40039C5.39961 5.44561 5.77889 4.52994 6.45403 3.85481C7.12916 3.17968 8.04483 2.80039 8.99961 2.80039C9.95439 2.80039 10.8701 3.17968 11.5452 3.85481C12.2203 4.52994 12.5996 5.44561 12.5996 6.40039Z" fill="white"/>
                    </svg>
                </span>
                <div class="ui label who">
                    <div class="title">Anyone with link can </div>
                    <i class="angle down icon"></i>
                </div>
                <div class="ui label role" key="sort">
                    <div class="title">can view</div>
                    <i class="angle down icon"></i>
                </div>
            </div>
            <div class="scrolling-content">	
                <div class="ui list-content list selection aligned"></div>				
            </div>
            <div class="footer">
                <div class="ui label link">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="#F4A933" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.955 9.46915L15.3033 12.1209C14.318 13.1039 12.9829 13.656 11.591 13.656C10.1991 13.656 8.86407 13.1039 7.8787 12.1209C7.67056 11.9093 7.55445 11.6241 7.55566 11.3273C7.55687 11.0305 7.6753 10.7462 7.88515 10.5364C8.09501 10.3265 8.37929 10.2081 8.67607 10.2069C8.97285 10.2057 9.25808 10.3218 9.46964 10.5299C10.0327 11.0917 10.7956 11.4072 11.591 11.4072C12.3863 11.4072 13.1492 11.0917 13.7123 10.5299L16.3639 7.87812C16.6442 7.59993 16.8669 7.26913 17.0191 6.90469C17.1713 6.54025 17.25 6.14935 17.2507 5.75442C17.2515 5.35948 17.1743 4.96829 17.0235 4.60327C16.8727 4.23825 16.6513 3.9066 16.372 3.62734C16.0928 3.34809 15.7611 3.12672 15.3961 2.97594C15.0311 2.82516 14.6399 2.74793 14.2449 2.74869C13.85 2.74946 13.4591 2.82819 13.0947 2.98038C12.7302 3.13257 12.3994 3.35522 12.1213 3.63556L10.2653 5.49171C10.1609 5.59665 10.0369 5.67996 9.90028 5.73688C9.76367 5.7938 9.61717 5.8232 9.46918 5.82341C9.32119 5.82361 9.1746 5.79462 9.03784 5.73808C8.90107 5.68154 8.7768 5.59857 8.67214 5.49393C8.56749 5.38928 8.48452 5.26502 8.42797 5.12825C8.37143 4.99148 8.34242 4.84491 8.34262 4.69691C8.34281 4.54892 8.37221 4.40242 8.42912 4.2658C8.48603 4.12919 8.56933 4.00514 8.67426 3.90078L10.5304 2.04453C11.515 1.05996 12.8503 0.506836 14.2427 0.506836C15.6351 0.506836 16.9705 1.05996 17.955 2.04453C18.9396 3.02909 19.4927 4.36445 19.4927 5.75684C19.4927 7.14923 18.9396 8.48458 17.955 9.46915H17.955ZM9.73476 14.5073L7.8787 16.3634C7.31536 16.9225 6.55345 17.2355 5.75979 17.234C4.96614 17.2325 4.20543 16.9165 3.64423 16.3553C3.08302 15.7942 2.76706 15.0334 2.76553 14.2398C2.764 13.4461 3.07701 12.6842 3.63605 12.1209L6.28767 9.46915C6.85073 8.90739 7.61363 8.5919 8.409 8.5919C9.20437 8.5919 9.96727 8.90739 10.5303 9.46915C10.7419 9.67729 11.0271 9.7934 11.3239 9.79219C11.6207 9.79099 11.905 9.67255 12.1148 9.4627C12.3247 9.25284 12.4431 8.96856 12.4443 8.67179C12.4455 8.37501 12.3294 8.08977 12.1213 7.87821C11.1359 6.89514 9.80085 6.34304 8.40895 6.34304C7.01706 6.34304 5.682 6.89514 4.69664 7.87821L2.04501 10.5298C1.06045 11.5144 0.507324 12.8498 0.507324 14.2422C0.507324 15.6345 1.06045 16.9699 2.04501 17.9545C3.02958 18.939 4.36494 19.4922 5.75733 19.4922C7.14971 19.4922 8.48507 18.939 9.46964 17.9545L11.3259 16.0982C11.4304 15.9937 11.5132 15.8697 11.5697 15.7332C11.6263 15.5967 11.6554 15.4504 11.6554 15.3027C11.6553 15.1549 11.6262 15.0086 11.5697 14.8722C11.5131 14.7357 11.4303 14.6116 11.3258 14.5072C11.2213 14.4027 11.0973 14.3199 10.9608 14.2633C10.8243 14.2068 10.678 14.1777 10.5303 14.1777C10.3825 14.1777 10.2362 14.2068 10.0997 14.2634C9.96324 14.3199 9.83923 14.4028 9.73476 14.5073Z"/>
                    </svg>
                    Copy Link
                </div>
                <div class="ui label done">
                    Done
                </div>
            </div>
        </div>
    </div>`;

const COPIED_MODAL_TEMPLATE = `
    <div class="modal-body copied-modal">
        <div class="scrolling content">
            <div class="scrolling-content">	
                <div class="ui label link copied">
                    <svg width="90" height="90" viewBox="0 0 190 190" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M95.5 189C147.139 189 189 147.139 189 95.5C189 43.8614 147.139 2 95.5 2C43.8614 2 2 43.8614 2 95.5C2 147.139 43.8614 189 95.5 189Z" fill="#54B265"/>
                        <path d="M139.761 75.4701L135.555 71.2449C133.903 69.585 131.049 69.585 129.397 71.2449L86.889 113.949L60.7535 87.6928C59.1012 86.0329 56.2473 86.0329 54.5951 87.6928L50.2392 91.918C48.5869 93.5778 48.5869 96.4449 50.2392 98.1048L83.7347 131.755C85.3869 133.415 88.2408 133.415 89.8931 131.755L93.7984 127.832L94.0988 127.53L139.761 81.6569C141.413 79.997 141.413 77.2808 139.761 75.4701Z" fill="#F4EFEF"/>
                    </svg>                
                    <div class="title">Link Copied!</div>
                </div>  
            </div>
        </div>
    </div>`;

export function getModalTemplate(key) {
    const templates = {
        symbol: SYMBOL_MODAL_TEMPLATE,
        indicator: INDICATOR_MODAL_TEMPLATE,
        setting: SETTING_MODAL_TEMPLATE,
        layout: LAYOUT_MODAL_TEMPLATE,
        share: SHARE_MODAL_TEMPLATE,
        copied: COPIED_MODAL_TEMPLATE
    };
    return templates[key];
}

const ROLE_POPUP_TEMPLATE = `
    <div class="ui list">
        <div class="item active" key="view">
            <div class="content">
                <svg width="12" class="check" height="10" viewBox="0 0 12 10" fill="#FCFCFC" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 0.971206L5.27938 9.37432L0 4.97432L0.996109 3.77899L5.05525 7.16109L10.786 0L12 0.971206Z"/>
                </svg>
                <span>can view</span>
            </div>
        </div>
        <div class="item" key="edit">
            <div class="content">
                <svg width="12" height="10" class="check" viewBox="0 0 12 10" fill="#FCFCFC" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 0.971206L5.27938 9.37432L0 4.97432L0.996109 3.77899L5.05525 7.16109L10.786 0L12 0.971206Z"/>
                </svg>
                <span>can edit</span>
            </div>
        </div>
        <div class="item remove" key="remove" style="border-top: 1px solid #000000;">
            <div class="content">
                <svg width="12" class="check" height="10" viewBox="0 0 12 10" fill="#FCFCFC" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 0.971206L5.27938 9.37432L0 4.97432L0.996109 3.77899L5.05525 7.16109L10.786 0L12 0.971206Z"/>
                </svg>
                <span>Remove</span>
            </div>
        </div>
    </div>
`;

const WHO_POPUP_TEMPLATE = `
    <div class="ui list">
        <div class="item active" key="every">
            <div class="content">
                <svg width="12" class="check" height="10" viewBox="0 0 12 10" fill="#FCFCFC" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 0.971206L5.27938 9.37432L0 4.97432L0.996109 3.77899L5.05525 7.16109L10.786 0L12 0.971206Z"/>
                </svg>
                <span>Anyone with link can</span>
            </div>
        </div>
        <div class="item" key="only">
            <div class="content">
                <svg width="12" height="10" class="check" viewBox="0 0 12 10" fill="#FCFCFC" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 0.971206L5.27938 9.37432L0 4.97432L0.996109 3.77899L5.05525 7.16109L10.786 0L12 0.971206Z"/>
                </svg>
                <span>Only people invited to this layout</span>
            </div>
        </div>
    </div>
`;

const ORDER_POPUP_TEMPLATE = `
    <div class="ui list">
        <div class="item parent" key="sort_by">
            <div class="content">
                <div class="header">SORT BY</div>
                <div class="list">
                    <div class="item" key="name">
                        <div class="content">
                            <svg width="12" class="check" height="10" viewBox="0 0 12 10" fill="#FCFCFC" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M12 0.971206L5.27938 9.37432L0 4.97432L0.996109 3.77899L5.05525 7.16109L10.786 0L12 0.971206Z"/>
                            </svg>
                            <span>Alphabetical</span>
                        </div>
                    </div>
                    <div class="item" key="created_at">
                        <div class="content">
                            <svg width="12" class="check" height="10" viewBox="0 0 12 10" fill="#FCFCFC" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M12 0.971206L5.27938 9.37432L0 4.97432L0.996109 3.77899L5.05525 7.16109L10.786 0L12 0.971206Z"/>
                            </svg>
                            <span>Date Created</span>
                        </div>
                    </div>
                    <div class="item" key="updated_at">
                        <div class="content">
                            <svg width="12" class="check" height="10" viewBox="0 0 12 10" fill="#FCFCFC" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M12 0.971206L5.27938 9.37432L0 4.97432L0.996109 3.77899L5.05525 7.16109L10.786 0L12 0.971206Z"/>
                            </svg>
                            <span>Date Edited</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="item parent" key="order_by">
            <div class="content">
                <div class="header">ORDER</div>
                <div class="list">
                    <div class="item" key="asc">
                        <div class="content">
                            <svg width="12" class="check" height="10" viewBox="0 0 12 10" fill="#FCFCFC" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M12 0.971206L5.27938 9.37432L0 4.97432L0.996109 3.77899L5.05525 7.16109L10.786 0L12 0.971206Z"/>
                            </svg>
                            <span>Ascending</span>
                        </div>
                    </div>
                    <div class="item" key="desc">
                        <div class="content">
                            <svg width="12" class="check" height="10" viewBox="0 0 12 10" fill="#FCFCFC" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M12 0.971206L5.27938 9.37432L0 4.97432L0.996109 3.77899L5.05525 7.16109L10.786 0L12 0.971206Z"/>
                            </svg>
                            <span>Descending</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

export function getPopupTemplate(key) {
    const templates = {
        role: ROLE_POPUP_TEMPLATE,
        who: WHO_POPUP_TEMPLATE,
        order: ORDER_POPUP_TEMPLATE
    };
    return templates[key];
}
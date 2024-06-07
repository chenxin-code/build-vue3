<template>
  <div style="margin: 30px 0"/>
  <el-button :icon="Printer" @click="print()">打印</el-button>
  <el-button :icon="Download" @click="exportPDF()">导出PDF</el-button>
  <el-dialog :model-value="false" width="50%" append-to-body>
    <div class="a4-size" style="position: relative;margin-bottom: 1.2em" contenteditable="true">
      <div class="title"
           style="font-size: 32px;text-align: center;position: relative;font-family: 'Microsoft Sans Serif', sans-serif;">
        销&nbsp;&nbsp;&nbsp; 售&nbsp;&nbsp;&nbsp; 合&nbsp;&nbsp;&nbsp; 同
      </div>
      <div style="position: absolute;top: 0.2em;font-size: 24px;">MEIJOY GROUP</div>
      <div style="font-size: 13px;margin-top: 1em;">
        <div class="width25">签约时间: <span contenteditable="true">{{ form.billDate }} </span></div>
        <div class="width25">签约地点: <span contenteditable="true">广州</span></div>
        <div class="width25">销售员: <span contenteditable="true">{{ form.follow ? form.follow : '' }} </span></div>
        <div class="width25">合同编号: <span contenteditable="true">{{ form.billNo }} </span></div>
      </div>
      <div style="font-size: 13px;">
        <div class="width50">卖方(甲方): {{ form.salesCompanyName ? form.salesCompanyName : '' }}</div>
        <div class="width50">买方(乙方): {{ form.customerName ? form.customerName : '' }}</div>
        <div class="width25"><span class="width20">电话:</span> <span
            class="width80 textCenter">{{ form.createdByPhone ? form.createdByPhone : '' }}</span></div>
        <div class="width25"><span class="width20">邮箱:</span> <span class="width80 textCenter">{{
            form.createdByEmail ? form.createdByEmail : (form.createdByCmpEmail ? form.createdByCmpEmail : '')
          }}</span></div>
        <div class="width25"><span class="width20">电话:</span> <span class="width80 textCenter">{{
            form.contactsMobilePhone ? form.contactsMobilePhone : (form.contactsTellPhone ? form.contactsTellPhone : '')
          }}</span></div>
        <div class="width25"><span class="width20">{{
            form.contactsEmail ? '邮箱:' : (form.contactsFax ? '传真:' : '')
          }}</span> <span class="width80 textCenter">{{
            form.contactsEmail ? form.contactsEmail : (form.contactsFax ? form.contactsFax : '')
          }}</span></div>
        <div class="width50"><span class="width20" style="width: 10%;">地址:</span> <span
            class="width80">{{ form.salesCompanyAddress ? form.salesCompanyAddress : '' }}</span></div>
        <div class="width50"><span class="width20" style="width: 10%;">地址:</span> <span
            class="width80">{{ form.customerAddress ? form.customerAddress : '' }}</span></div>
      </div>
      <div style="font-size: 13px;">
        <div class="width100">本合同由甲乙双方在平等自愿友好协商的基础上订立商品买卖合同并共同遵守:</div>
        <div class="width100">1、 货物描述:</div>
        <table style="margin-bottom: 0.5em;">
          <tbody>
          <tr>
            <td>品种</td>
            <td>牌号/批次号</td>
            <td>厂商/产地</td>
            <td>数量({{ '吨' }})</td>
            <td>单价(元){{ form.taxIncluded === 1 ? '(含税)' : '(未含税)' }}</td>
            <td>金额(元)</td>
            <td>币种</td>
            <td>运输方式</td>
            <td>包装方式</td>
          </tr>
          <tr v-for="item in form.printTableData" :key="item.id">
            <td>{{ item.tradeNo ? item.tradeNo : '' }}</td>
            <td>{{ item.gradeNo ? item.gradeNo : '' }}/{{ item.batchNo ? item.batchNo : '' }}</td>
            <td>{{ item.enName ? item.enName : '' }} {{ item.nativeCountry ? item.nativeCountry : '' }}</td>
            <td>{{ item.num ? item.num * 1 : '' }}</td>
            <td>{{ item.salePrice ? item.salePrice : '' }}</td>
            <td>{{ item.money ? item.money : '' }}</td>
            <td>{{ form.cnCurrencyName ? form.cnCurrencyName : '' }}</td>
            <td>{{
                form.tradeTerms === 1 ? '用户自提' : (form.tradeTerms === 2 ? '送货上门' : (form.tradeTerms === 3 ? '仓单交收' : ''))
              }}
            </td>
            <td>{{ item.packType ? item.packType : '' }}</td>
          </tr>
          <tr>
            <td colspan="2">合 计 金 额</td>
            <td colspan="2">{{ form.totalMoney ? form.totalMoney : '' }}</td>
            <td>金 额 大 写</td>
            <td colspan="4">{{ form.cnTotalMoney ? form.cnTotalMoney : '' }}</td>
          </tr>
          <tr v-if="form.taxIncluded === 1">
            <td colspan="2">{{ form.taxIncluded === 1 ? '不含税总额：' : '合计金额' }}</td>
            <td colspan="2">{{ form.totalMoney ? (form.totalMoney * 1 / 1.13).toFixed(2) : '' }}</td>
            <td>增值税税额：</td>
            <td colspan="4">
              {{ form.totalMoney ? (form.totalMoney * 1 - (form.totalMoney * 1 / 1.13).toFixed(2)).toFixed(2) : '' }}
            </td>
          </tr>
          </tbody>
        </table>
        <div class="width20">2、 交货时间地点方式:</div>
        <div class="width80">
          交货时间: {{ form.deliveryTime ? form.deliveryTime : '' }}
        </div>
        <div class="width20"></div>
        <div class="width80">
          交货地点: {{ form.deliverAddress ? form.deliverAddress[0] : '' }}
          {{ form.deliverAddress ? form.deliverAddress[1] : '' }}
          {{ form.deliverAddress ? form.deliverAddress[2] : '' }}
        </div>
        <div class="width20" v-if="form.freeclosingDate"></div>
        <div class="width80" v-if="form.freeclosingDate">&nbsp;&nbsp;&nbsp;&nbsp;免仓期时间: {{
            form.freeclosingDate
          }}
        </div>
        <div class="width20"></div>
        <div class="width80" v-if="form.tradeTerms === 1 || form.tradeTerms === 2">
          {{
            form.expenseType ? form.expenseType : '费用'
          }}:{{ form.loadingCost ? (form.loadingCost === 1 ? '客付' : '我司付') : '' }}
        </div>
        <div class="width100" v-if="pennyFlag">
          3、 乙方应于签约{{ form.monthlyDay ? form.monthlyDay : '  ' }}工作小时内支付{{
            form.penny ? form.penny : '  '
          }}元定金。若乙方逾期支付，甲方有权取消合同并追加由乙方带来的所有损失。
        </div>
        <div class="width100" v-if="!pennyFlag">
          3、 货款支付期限和方式: {{ form.payTimeAndType ? form.payTimeAndType : '' }}
        </div>
        <div class="width100" v-if="pennyFlag">
          4、 货款支付期限和方式: {{ form.payTimeAndType ? form.payTimeAndType : '' }}
        </div>
        <div class="width100">
          <span>{{ pennyFlag ? '5' : '4' }}</span>、 质量标准:
          按原厂质量标准或按样品或按实物为准;涉及副牌的货物不保证用途，自提的货物需当场验收并协商解决，送到的货物若有质量异议需在到货24小时内提出，并于10日内提交政府认可的第三方机构出具检测报告。
        </div>
        <div class="width100">
          <span>{{ pennyFlag ? '6' : '5' }}</span>、 合理损耗计算方法: 合理损耗为总数量的千分之一。
        </div>
        <div class="width100">
          <span>{{ pennyFlag ? '7' : '5' }}</span>、
          违约责任:按照《中华人民共和国民法典》及其它有关法律法规执行，乙方未按合同条约支付款项的，甲方有权单方面取消合同并追偿一切损失。乙方接到甲方付款通知单5天内不支付的，甲方有权没收定金及处置货物。
        </div>
        <div class="width100">
          <span>{{ pennyFlag ? '8' : '7' }}</span>、 不可抗力:
          因自然灾害、疫病、火灾及水灾、码头罢工、海关清关等无法预见、无法克服、不可避免的事件导致甲方不能履行合同，甲方不需要付违约责任，但甲方需在发生不可抗力5个工作日内书面告知乙方并在合理期限内提供证明。
        </div>
        <div class="width100">
          <span>{{ pennyFlag ? '9' : '8' }}</span>、 争议解决: 双方协商，若不能达成一致，可向甲方所在地法院起诉。
        </div>
        <div class="width11"><span>{{ pennyFlag ? '10' : '9' }}</span>、其它事项:</div>
        <div class="width89">A:不能在正本文件上补充修改，应另行签订书面文件。</div>
        <div class="width11"></div>
        <div class="width89">
          B:未涉及条款按《中华人民共和国民法典》的有关规定执行，逾期货款每天加收0.5%利息,直到付清为止。
        </div>
        <div class="width11"></div>
        <div class="width89">
          C:本合同一式两份，经双方签名盖章后生效，QQ、微信、扫描件及传真签订同时有效。本合同24小时内回传有效。
        </div>
        <div class="width11"></div>
        <div class="width89">D: 以上数量允许+/-{{ form.accountStatement ? form.accountStatement : '0' }}%偏差，
          以实际出货为准。
        </div>
        <div class="width11"></div>
        <div class="width89">
          E:无重量标识货物出货以第三方公正大磅重量为准，重量异议只接受第三方公正大磅数据,每车偏差50kg不退不补。
        </div>
        <div class="width11" v-if="form.descalingInstructions"></div>
        <div class="width89" v-if="form.descalingInstructions">F:除皮说明: {{ form.descalingInstructions }}</div>
        <div class="width100" v-if="form.additionalTerms">
          <span>{{ pennyFlag ? '11' : '10' }}</span>、 备注:&nbsp;&nbsp; {{ form.additionalTerms }}
        </div>
      </div>
      <div class="width100" style="margin-bottom: 2em;"></div>
      <div style="font-size: 13px; position: absolute;bottom: 0;">
        <div class="width50">卖方(甲方)盖章:</div>
        <div class="width50">买方(乙方)盖章:</div>
        <div class="width50">签约代表:</div>
        <div class="width50">签约代表:</div>
        <div class="width100">账户名称: {{ form.nameOfAccount ? form.nameOfAccount : '' }}</div>
        <div class="width100">银行账号: {{ form.collectionAccount ? form.collectionAccount : '' }}</div>
        <div class="width100" style="margin-bottom: 0;">开户银行: {{
            form.bankOfDeposit ? form.bankOfDeposit : ''
          }}
        </div>
      </div>
    </div>
  </el-dialog>
  <div style="display: none">
    <div id="printPage">
      <div class="a4-size" style="position: relative;margin-bottom: 1.2em">
        <div class="title"
             style="font-size: 32px;text-align: center;position: relative;font-family: 'Microsoft Sans Serif', sans-serif;">
          销&nbsp;&nbsp;&nbsp; 售&nbsp;&nbsp;&nbsp; 合&nbsp;&nbsp;&nbsp; 同
        </div>
        <div style="position: absolute;top: 0.2em;font-size: 24px;">MEIJOY GROUP</div>
        <div style="font-size: 13px;margin-top: 1em;">
          <div class="width25">签约时间: <span>{{ form.billDate }} </span></div>
          <div class="width25">签约地点: <span>{{ '广州' }} </span></div>
          <div class="width25">销售员: <span>{{ form.follow ? form.follow : '' }} </span></div>
          <div class="width25">合同编号: <span>{{ form.billNo }} </span></div>
        </div>
        <div style="font-size: 13px;">
          <div class="width50">卖方(甲方): {{ form.salesCompanyName ? form.salesCompanyName : '' }}</div>
          <div class="width50">买方(乙方): {{ form.customerName ? form.customerName : '' }}</div>
          <div class="width25"><span class="width20">电话:</span> <span
              class="width80 textCenter">{{ form.createdByPhone ? form.createdByPhone : '' }}</span></div>
          <div class="width25"><span class="width20">邮箱:</span> <span class="width80 textCenter">{{
              form.createdByEmail ? form.createdByEmail : (form.createdByCmpEmail ? form.createdByCmpEmail : '')
            }}</span></div>
          <div class="width25"><span class="width20">电话:</span> <span class="width80 textCenter">{{
              form.contactsMobilePhone ? form.contactsMobilePhone : (form.contactsTellPhone ? form.contactsTellPhone : '')
            }}</span></div>
          <div class="width25"><span
              class="width20">{{ form.contactsEmail ? '邮箱:' : (form.contactsFax ? '传真:' : '') }}</span> <span
              class="width80 textCenter">{{
              form.contactsEmail ? form.contactsEmail : (form.contactsFax ? form.contactsFax : '')
            }}</span></div>
          <div class="width50"><span class="width20" style="width: 10%;">地址:</span> <span
              class="width80">{{ form.salesCompanyAddress ? form.salesCompanyAddress : '' }}</span></div>
          <div class="width50"><span class="width20" style="width: 10%;">地址:</span> <span
              class="width80">{{ form.customerAddress ? form.customerAddress : '' }}</span></div>
        </div>
        <div style="font-size: 13px;">
          <div class="width100">本合同由甲乙双方在平等自愿友好协商的基础上订立商品买卖合同并共同遵守:</div>
          <div class="width100">1、 货物描述:</div>
          <table style="margin-bottom: 0.5em;">
            <tbody>
            <tr>
              <td>品种</td>
              <td>牌号/批次号</td>
              <td>厂商/产地</td>
              <td>数量({{ '吨' }})</td>
              <td>单价(元){{ form.taxIncluded === 1 ? '(含税)' : '(未含税)' }}</td>
              <td>金额(元)</td>
              <td>币种</td>
              <td>运输方式</td>
              <td>包装方式</td>
            </tr>
            <tr v-for="item in form.printTableData" :key="item.id">
              <td>{{ item.tradeNo ? item.tradeNo : '' }}</td>
              <td>{{ item.gradeNo ? item.gradeNo : '' }}/{{ item.batchNo ? item.batchNo : '' }}</td>
              <td>{{ item.enName ? item.enName : '' }} {{ item.nativeCountry ? item.nativeCountry : '' }}</td>
              <td>{{ item.num ? item.num * 1 : '' }}</td>
              <td>{{ item.salePrice ? item.salePrice : '' }}</td>
              <td>{{ item.money ? item.money : '' }}</td>
              <td>{{ form.cnCurrencyName ? form.cnCurrencyName : '' }}</td>
              <td>{{
                  form.tradeTerms === 1 ? '用户自提' : (form.tradeTerms === 2 ? '送货上门' : (form.tradeTerms === 3 ? '仓单交收' : ''))
                }}
              </td>
              <td>{{ item.packType ? item.packType : '' }}</td>
            </tr>
            <tr>
              <td colspan="2">合 计 金 额</td>
              <td colspan="2">{{ form.totalMoney ? form.totalMoney : '' }}</td>
              <td>金 额 大 写</td>
              <td colspan="4">{{ form.cnTotalMoney ? form.cnTotalMoney : '' }}</td>
            </tr>
            <tr v-if="form.taxIncluded === 1">
              <td colspan="2">{{ form.taxIncluded === 1 ? '不含税总额：' : '合计金额' }}</td>
              <td colspan="2">{{ form.totalMoney ? (form.totalMoney * 1 / 1.13).toFixed(2) : '' }}</td>
              <td>增值税税额：</td>
              <td colspan="4">
                {{ form.totalMoney ? (form.totalMoney * 1 - (form.totalMoney * 1 / 1.13).toFixed(2)).toFixed(2) : '' }}
              </td>
            </tr>
            </tbody>
          </table>
          <div class="width20">2、 交货时间地点方式:</div>
          <div class="width80">
            交货时间: {{ form.deliveryTime ? form.deliveryTime : '' }}
          </div>
          <div class="width20"></div>
          <div class="width80">
            交货地点: {{ form.deliverAddress ? form.deliverAddress[0] : '' }}
            {{ form.deliverAddress ? form.deliverAddress[1] : '' }}
            {{ form.deliverAddress ? form.deliverAddress[2] : '' }}
          </div>
          <div class="width20" v-if="form.freeclosingDate"></div>
          <div class="width80" v-if="form.freeclosingDate">&nbsp;&nbsp;&nbsp;&nbsp;免仓期时间: {{
              form.freeclosingDate
            }}
          </div>
          <div class="width20"></div>
          <div class="width80" v-if="form.tradeTerms === 1 || form.tradeTerms === 2">
            {{
              form.expenseType ? form.expenseType : '费用'
            }}:{{ form.loadingCost ? (form.loadingCost === 1 ? '客付' : '我司付') : '' }}
          </div>
          <div class="width100" v-if="pennyFlag">
            3、 乙方应于签约{{
              form.monthlyDay ? form.monthlyDay : '  '
            }}工作小时内支付{{ form.penny ? form.penny : '  ' }}元定金。若乙方逾期支付，甲方有权取消合同并追加由乙方带来的所有损失。
          </div>
          <div class="width100" v-if="!pennyFlag">
            3、 货款支付期限和方式: {{ form.payTimeAndType ? form.payTimeAndType : '' }}
          </div>
          <div class="width100" v-if="pennyFlag">
            4、 货款支付期限和方式: {{ form.payTimeAndType ? form.payTimeAndType : '' }}
          </div>
          <div class="width100">
            <span>{{ pennyFlag ? '5' : '4' }}</span>、 质量标准:
            按原厂质量标准或按样品或按实物为准;涉及副牌的货物不保证用途，自提的货物需当场验收并协商解决，送到的货物若有质量异议需在到货24小时内提出，并于10日内提交政府认可的第三方机构出具检测报告。
          </div>
          <div class="width100">
            <span>{{ pennyFlag ? '6' : '5' }}</span>、 合理损耗计算方法: 合理损耗为总数量的千分之一。
          </div>
          <div class="width100">
            <span>{{ pennyFlag ? '7' : '5' }}</span>、
            违约责任:按照《中华人民共和国民法典》及其它有关法律法规执行，乙方未按合同条约支付款项的，甲方有权单方面取消合同并追偿一切损失。乙方接到甲方付款通知单5天内不支付的，甲方有权没收定金及处置货物。
          </div>
          <div class="width100">
            <span>{{ pennyFlag ? '8' : '7' }}</span>、 不可抗力:
            因自然灾害、疫病、火灾及水灾、码头罢工、海关清关等无法预见、无法克服、不可避免的事件导致甲方不能履行合同，甲方不需要付违约责任，但甲方需在发生不可抗力5个工作日内书面告知乙方并在合理期限内提供证明。
          </div>
          <div class="width100">
            <span>{{ pennyFlag ? '9' : '8' }}</span>、 争议解决: 双方协商，若不能达成一致，可向甲方所在地法院起诉。
          </div>
          <div class="width11"><span>{{ pennyFlag ? '10' : '9' }}</span>、其它事项:</div>
          <div class="width89">A:不能在正本文件上补充修改，应另行签订书面文件。</div>
          <div class="width11"></div>
          <div class="width89">
            B:未涉及条款按《中华人民共和国民法典》的有关规定执行，逾期货款每天加收0.5%利息,直到付清为止。
          </div>
          <div class="width11"></div>
          <div class="width89">
            C:本合同一式两份，经双方签名盖章后生效，QQ、微信、扫描件及传真签订同时有效。本合同24小时内回传有效。
          </div>
          <div class="width11"></div>
          <div class="width89">D: 以上数量允许+/-{{
              form.accountStatement ? form.accountStatement : '0'
            }}%偏差，以实际出货为准。
          </div>
          <div class="width11"></div>
          <div class="width89">
            E:无重量标识货物出货以第三方公正大磅重量为准，重量异议只接受第三方公正大磅数据,每车偏差50kg不退不补。
          </div>
          <div class="width11" v-if="form.descalingInstructions"></div>
          <div class="width89" v-if="form.descalingInstructions">F:除皮说明: {{ form.descalingInstructions }}</div>
          <div class="width100" v-if="form.additionalTerms">
            <span>{{ pennyFlag ? '11' : '10' }}</span>、 备注:&nbsp;&nbsp; {{ form.additionalTerms }}
          </div>
        </div>
        <div class="width100" style="margin-bottom: 2em;"></div>
        <div style="font-size: 13px; position: absolute;bottom: 0;">
          <div class="width50">卖方(甲方)盖章:</div>
          <div class="width50">买方(乙方)盖章:</div>
          <div class="width50">签约代表:</div>
          <div class="width50">签约代表:</div>
          <div class="width100">账户名称: {{ form.nameOfAccount ? form.nameOfAccount : '' }}</div>
          <div class="width100">银行账号: {{ form.collectionAccount ? form.collectionAccount : '' }}</div>
          <div class="width100" style="margin-bottom: 0;">开户银行: {{ form.bankOfDeposit ? form.bankOfDeposit : '' }}
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="print">
    <div ref="PDF" class="a4-size2">
      <div class="a4-size" style="position: relative;margin-bottom: 1.2em;">
        <div class="title"
             style="font-size: 32px;text-align: center;position: relative;font-family: 'Microsoft Sans Serif', sans-serif;">
          销&nbsp;&nbsp;&nbsp; 售&nbsp;&nbsp;&nbsp; 合&nbsp;&nbsp;&nbsp; 同
        </div>
        <div style="position: absolute;top: 0.2em;font-size: 24px;">MEIJOY GROUP</div>
        <div style="font-size: 13px;margin-top: 1em;">
          <div class="width25">签约时间: <span>{{ form.billDate }} </span></div>
          <div class="width25">签约地点: <span>广州</span></div>
          <div class="width25">销售员: <span>{{ form.follow ? form.follow : '' }} </span></div>
          <div class="width25">合同编号: <span>{{ form.billNo }} </span></div>
        </div>
        <div style="font-size: 13px;">
          <div class="width50">卖方(甲方): {{ form.salesCompanyName ? form.salesCompanyName : '' }}</div>
          <div class="width50">买方(乙方): {{ form.customerName ? form.customerName : '' }}</div>
          <div class="width25"><span class="width20">电话:</span> <span
              class="width80 textCenter">{{ form.createdByPhone ? form.createdByPhone : '' }}</span></div>
          <div class="width25"><span class="width20">邮箱:</span> <span class="width80 textCenter">{{
              form.createdByEmail ? form.createdByEmail : (form.createdByCmpEmail ? form.createdByCmpEmail : '')
            }}</span></div>
          <div class="width25"><span class="width20">电话:</span> <span class="width80 textCenter">{{
              form.contactsMobilePhone ? form.contactsMobilePhone : (form.contactsTellPhone ? form.contactsTellPhone : '')
            }}</span></div>
          <div class="width25"><span
              class="width20">{{ form.contactsEmail ? '邮箱:' : (form.contactsFax ? '传真:' : '') }}</span> <span
              class="width80 textCenter">{{
              form.contactsEmail ? form.contactsEmail : (form.contactsFax ? form.contactsFax : '')
            }}</span></div>
          <div class="width50"><span class="width20" style="width: 10%;">地址:</span> <span
              class="width80">{{ form.salesCompanyAddress ? form.salesCompanyAddress : '' }}</span></div>
          <div class="width50"><span class="width20" style="width: 10%;">地址:</span> <span
              class="width80">{{ form.customerAddress ? form.customerAddress : '' }}</span></div>
        </div>
        <div style="font-size: 13px;">
          <div class="width100">本合同由甲乙双方在平等自愿友好协商的基础上订立商品买卖合同并共同遵守:</div>
          <div class="width100">1、 货物描述:</div>
          <table style="margin-bottom: 0.5em;">
            <tbody>
            <tr>
              <td>品种</td>
              <td>牌号/批次号</td>
              <td>厂商/产地</td>
              <td>数量({{ '吨' }})</td>
              <td>单价(元){{ form.taxIncluded === 1 ? '(含税)' : '(未含税)' }}</td>
              <td>金额(元)</td>
              <td>币种</td>
              <td>运输方式</td>
              <td>包装方式</td>
            </tr>
            <tr v-for="item in form.printTableData" :key="item.id">
              <td>{{ item.tradeNo ? item.tradeNo : '' }}</td>
              <td>{{ item.gradeNo ? item.gradeNo : '' }}/{{ item.batchNo ? item.batchNo : '' }}</td>
              <td>{{ item.enName ? item.enName : '' }} {{ item.nativeCountry ? item.nativeCountry : '' }}</td>
              <td>{{ item.num ? item.num * 1 : '' }}</td>
              <td>{{ item.salePrice ? item.salePrice : '' }}</td>
              <td>{{ item.money ? item.money : '' }}</td>
              <td>{{ form.cnCurrencyName ? form.cnCurrencyName : '' }}</td>
              <td>
                {{
                  form.tradeTerms === 1 ? '用户自提' : (form.tradeTerms === 2 ? '送货上门' : (form.tradeTerms === 3 ? '仓单交收' : ''))
                }}
              </td>
              <td>{{ item.packType ? item.packType : '' }}</td>
            </tr>
            <tr>
              <td colspan="2">合 计 金 额</td>
              <td colspan="2">{{ form.totalMoney ? form.totalMoney : '' }}</td>
              <td>金 额 大 写</td>
              <td colspan="4">{{ form.cnTotalMoney ? form.cnTotalMoney : '' }}</td>
            </tr>
            <tr v-if="form.taxIncluded === 1">
              <td colspan="2">{{ form.taxIncluded === 1 ? '不含税总额：' : '合计金额' }}</td>
              <td colspan="2">{{ form.totalMoney ? (form.totalMoney * 1 / 1.13).toFixed(2) : '' }}</td>
              <td>增值税税额：</td>
              <td colspan="4">
                {{ form.totalMoney ? (form.totalMoney * 1 - (form.totalMoney * 1 / 1.13).toFixed(2)).toFixed(2) : '' }}
              </td>
            </tr>
            </tbody>
          </table>
          <div class="width20">2、 交货时间地点方式:</div>
          <div class="width80">交货时间: {{ form.deliveryTime ? form.deliveryTime : '' }}</div>
          <div class="width20"></div>
          <div class="width80">
            交货地点: {{ form.deliverAddress ? form.deliverAddress[0] : '' }}
            {{ form.deliverAddress ? form.deliverAddress[1] : '' }}
            {{ form.deliverAddress ? form.deliverAddress[2] : '' }}
          </div>
          <div class="width20" v-if="form.freeclosingDate"></div>
          <div class="width80" v-if="form.freeclosingDate">&nbsp;&nbsp;&nbsp;&nbsp;免仓期时间: {{
              form.freeclosingDate
            }}
          </div>
          <div class="width20"></div>
          <div class="width80" v-if="form.tradeTerms === 1 || form.tradeTerms === 2">
            {{
              form.expenseType ? form.expenseType : '费用'
            }}:{{ form.loadingCost ? (form.loadingCost === 1 ? '客付' : '我司付') : '' }}
          </div>
          <div class="width100" v-if="pennyFlag">
            3、 乙方应于{{ form.monthlyDay ? form.monthlyDay : '  ' }}工作小时内支付{{
              form.penny ? form.penny : '  '
            }}元定金。若乙方逾期支付，甲方有权取消合同并追加由乙方带来的所有损失。
          </div>
          <div class="width100" v-if="!pennyFlag">
            3、 货款支付期限和方式: {{ form.payTimeAndType ? form.payTimeAndType : '' }}
          </div>
          <div class="width100" v-if="pennyFlag">
            4、 货款支付期限和方式: {{ form.payTimeAndType ? form.payTimeAndType : '' }}
          </div>
          <div class="width100">
            <span>{{ pennyFlag ? '5' : '4' }}</span>、 质量标准:
            按原厂质量标准或按样品或按实物为准;涉及副牌的货物不保证用途，自提的货物需当场验收并协商解决，送到的货物若有质量异议需在到货24小时内提出，并于10日内提交政府认可的第三方机构检测报告。
          </div>
          <div class="width100">
            <span>{{ pennyFlag ? '6' : '5' }}</span>、 合理损耗计算方法: 合理损耗为总数量的千分之一。
          </div>
          <div class="width100">
            <span>{{ pennyFlag ? '7' : '5' }}</span>、
            违约责任:按照《中华人民共和国民法典》及其它有关法律法规执行，乙方未按合同条约支付款项的，甲方有权单方面取消合同并追偿一切损失。乙方接到甲方付款通知单5天内不支付的，甲方有权没收定金及处置货物。
          </div>
          <div class="width100">
            <span>{{ pennyFlag ? '8' : '7' }}</span>、 不可抗力:
            因自然灾害、疫病、火灾及水灾、码头罢工、海关清关等无法预见、无法克服、不可避免的事件导致甲方不能履行合同，甲方不需要付违约责任，但甲方需在发生不可抗力5个工作日内书面告知乙方并在合理期限内提供证明。
          </div>
          <div class="width100">
            <span>{{ pennyFlag ? '9' : '8' }}</span>、 争议解决: 双方协商，若不能达成一致，可向原告所在地法院起诉。
          </div>
          <div class="width11"><span>{{ pennyFlag ? '10' : '9' }}</span>、其它事项:</div>
          <div class="width89">A:不能在正本文件上补充修改，应另行签订书面文件。</div>
          <div class="width11"></div>
          <div class="width89">
            B:未涉及条款按《中华人民共和国民法典》的有关规定执行，逾期货款每天加收0.5%利息,直到付清为止。
          </div>
          <div class="width11"></div>
          <div class="width89">
            C:本合同一式两份，经双方签名盖章后生效，QQ、微信、扫描件及传真签订同时有效。本合同24小时内回传有效。
          </div>
          <div class="width11"></div>
          <div class="width89">D: 以上数量允许+/-10%偏差， 以实际出货为准。</div>
          <div class="width11"></div>
          <div class="width89">
            E:无重量标识货物出货以第三方公正大磅重量为准，重量异议只接受第三方公正大磅数据,每车偏差50kg不退不补。
          </div>
          <div class="width11" v-if="form.descalingInstructions"></div>
          <div class="width89" v-if="form.descalingInstructions">F:除皮说明: {{ form.descalingInstructions }}</div>
          <div class="width100" v-if="form.additionalTerms">
            <span>{{ pennyFlag ? '11' : '10' }}</span>、 备注:&nbsp;&nbsp; {{ form.additionalTerms }}
          </div>
        </div>
        <div class="width100" style="margin-bottom: 2em;"></div>
        <div style="font-size: 13px; position: absolute;top: 80em;">
          <div class="width50">卖方(甲方)盖章:</div>
          <div class="width50">买方(乙方)盖章:</div>
          <div class="width50">签约代表:</div>
          <div class="width50">签约代表:</div>
          <div class="width100">账户名称: {{ form.nameOfAccount ? form.nameOfAccount : '' }}</div>
          <div class="width100">银行账号: {{ form.collectionAccount ? form.collectionAccount : '' }}</div>
          <div class="width100">开户银行: {{ form.bankOfDeposit ? form.bankOfDeposit : '' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import printJS from 'print-js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {ref, computed, nextTick} from 'vue';
import {Printer, Download} from '@element-plus/icons-vue';

const form = ref({
  "id": "1728943387727220737",
  "createdBy": "1123598821738675201",
  "createdDept": "1123598813738675201",
  "createdTime": "2023-11-27 09:06:41",
  "updatedBy": "1719558025066156033",
  "updatedTime": "2024-01-11 16:05:57",
  "deleteFlag": false,
  "tenantId": "000000",
  "status": "",
  "billNo": "XS00000020",
  "customerId": "-1977581567",
  "billDate": "2023-11-27",
  "followId": "1123598821738675201",
  "tradeTerms": 1,
  "money": null,
  "currency": "CNY",
  "collectionClause": "1",
  "additionalTerms": "",
  "reviewStatus": "0",
  "verifyStatus": "0",
  "verifier": "",
  "verifierDate": "",
  "completionStatus": "0",
  "salesCompany": "1694603240867966977",
  "loadingCost": 1,
  "freeclosingDate": "",
  "deliveryDate": [
    "2023",
    "11",
    "27"
  ],
  "accountStatement": 0,
  "taxIncluded": 1,
  "collectionAccount": "",
  "descalingInstructions": "",
  "customsClearance": "",
  "shippingInstructions": "",
  "documentaryInstruction": "",
  "contractNature": "0",
  "srcBillId": [
    "1743088457790971905"
  ],
  "srcBillType": "1",
  "srcNo": [
    "CG00000011"
  ],
  "purContractLsd": "",
  "lsd": "2024-01-05 00:00:00",
  "advanceTime": "",
  "depositAndArrears": false,
  "pennyTime": "",
  "penny": "46460.00",
  "uncollectionClause": "",
  "unpaymentTime": "",
  "unpaymentDay": 30,
  "billType": "",
  "billDay": "",
  "monthlyDay": 2,
  "reviewId": "",
  "submitState": "1",
  "submitId": "1719558025066156033",
  "destination": "",
  "deliveryStore": "枢纽港南沙仓",
  "address": "广州市南沙区环市大道南路南横工业区三期厂房",
  "contactPerson": "黄嘉俊",
  "remark": "",
  "shipment": "",
  "depId": "1123598813738675201",
  "quoteStatus": "",
  "creditDate": "",
  "creditDay": "10",
  "dpDate": "",
  "dpDay": "2",
  "reviewDate": "",
  "calculateWeightWay": "",
  "showInvoiceButton": false,
  "refInvoiceStatus": 0,
  "invoiceRefDone": 0,
  "saleoRefDone": 0,
  "createdByPhone": "",
  "createdByEmail": "",
  "time": "",
  "bankOfDeposit": "",
  "nameOfAccount": "",
  "contactsMobilePhone": "15325212201",
  "contactsTellPhone": "",
  "contactsEmail": "",
  "contactsFax": "",
  "follow": "管理员",
  "salesCompanyName": "广东美胶物产有限公司",
  "salesCompanyPhone": "020-32386116",
  "salesCompanyEmail": "",
  "salesCompanyAddress": "广州市南沙区南沙街南横村环市大道南58号南横工业区二期办公楼二层（自编之一）（仅限办公）",
  "customerName": "佛山市美鹭酒店管理有限公司",
  "customerPhone": "15320210210",
  "customerEmail": "",
  "customerAddress": "广州南沙",
  "deliverAddress": [
    "广州市南沙区环市大道南路南横工业区三期厂房",
    "黄嘉俊",
    "13580568888"
  ],
  "deliveryTime": "乙方应在2023年11月27日前完成提货。",
  "expenseType": "装车费用",
  "payTimeAndType": "ETD 2 天内。增值税专用发票会在付款及收货完成后安排寄出,未经卖方法人签名及公司盖章确认的现金交易无效。",
  "cnCurrencyName": "人民币",
  "printTableData": [
    {
      "id": "1745355944507097089",
      "srcBillId": "",
      "srcBillType": "",
      "salId": "1728943387727220737",
      "tradeNo": "HDPE",
      "gradeNo": "DMDJ-6200 NT",
      "gradeId": "9917cfc09f072a2895501efb306e9f25",
      "commodityId": "1742784000027066370",
      "commodityCode": "PLS0000000018",
      "enName": "NUC",
      "batchNo": "1000",
      "unit": "MT",
      "num": "10.0000",
      "salePrice": "2.00",
      "money": "20.00",
      "pkg": "1",
      "orgRoyaltyPrice": "0.00",
      "royaltyPrice": "0.00",
      "brokerage": "0.00",
      "number": null,
      "packingSpecification": "12.00",
      "unitId": "1914736641",
      "manufacturerId": "ef9d08a808a73826f4c303730b46a34f",
      "tradeId": "5",
      "packingSpecificationId": "1914736641",
      "surplus": null,
      "linkNum": null,
      "factor": null,
      "warehouseId": "",
      "storage": "",
      "companyId": "",
      "packingSpecificationDesc": "12.00MT",
      "symbol": "",
      "iwName": "",
      "bcName": "",
      "cnName": "",
      "buName": "",
      "pkgType": "1",
      "puOrderId": "",
      "stockUnitId": "1914736641",
      "stockUnit": "MT",
      "stockNum": "10.0000",
      "nativeCountry": "Japan",
      "packType": "小包"
    },
    {
      "id": "1745356187848032257",
      "srcBillId": "",
      "srcBillType": "",
      "salId": "1728943387727220737",
      "tradeNo": "HDPE",
      "gradeNo": "DMDJ-6200 NT",
      "gradeId": "9917cfc09f072a2895501efb306e9f25",
      "commodityId": "1742784000027066370",
      "commodityCode": "PLS0000000018",
      "enName": "NUC",
      "batchNo": "1000",
      "unit": "MT",
      "num": "0.0000",
      "salePrice": "3.00",
      "money": "0.00",
      "pkg": "0",
      "orgRoyaltyPrice": "0.00",
      "royaltyPrice": "0.00",
      "brokerage": "0.00",
      "number": null,
      "packingSpecification": "12.00",
      "unitId": "1914736641",
      "manufacturerId": "ef9d08a808a73826f4c303730b46a34f",
      "tradeId": "5",
      "packingSpecificationId": "1914736641",
      "surplus": null,
      "linkNum": null,
      "factor": null,
      "warehouseId": "",
      "storage": "",
      "companyId": "",
      "packingSpecificationDesc": "12.00MT",
      "symbol": "",
      "iwName": "",
      "bcName": "",
      "cnName": "",
      "buName": "",
      "pkgType": "1",
      "puOrderId": "",
      "stockUnitId": "1914736641",
      "stockUnit": "MT",
      "stockNum": "0.0000",
      "nativeCountry": "Japan",
      "packType": "小包"
    }
  ],
  "totalMoney": "20.00",
  "totalNum": "10.0000",
  "totalPkg": "1",
  "cnTotalMoney": "贰拾元整"
});

const pennyFlag = computed(() => {
  console.log('computed只会调用1次');
  return form.value.penny > 0;
});

const PDF = ref(null);

const print = () => {
  nextTick(() => {
    printJS({
      printable: 'printPage', // 可以直接用id名，或者用ref获取相应的元素标签
      type: 'html',
      targetStyles: ['*'],
      maxWidth: 650,
      scanStyles: false,
      style: `
            /* 定义A4纸尺寸的div元素 */
            .a4-size {
              width: 21cm;
              height: 29.7cm;
            }
            div {
              width: 100%;
              margin-bottom: 0.5em;
              font-family: '宋体', sans-serif;
              line-height:1.5;
            }

            table {
              border-collapse: collapse;
              width: 100%;
              font-size: 13px;
              font-family: '宋体', sans-serif;
            }

            th {
              text-align: center;
              white-space: nowrap;
              font-weight: bold;
              width: 100%;
            }

            th, td {
              border: 1px solid black;
              padding: 8px;
              text-align: center;
            }

            .textCenter {
              text-align: center;
            }

            .width11 {
              display: flex;
              float: left;
              width: 11%;
              font-size: 13px;
            }
            .width20 {
              display: flex;
              float: left;
              width: 20%;
              font-size: 13px;
            }
            .width25 {
              display: flex;
              float: left;
              width: 25%;
              font-size: 13px;
            }
            .width50 {
              display: flex;
              float: left;
              width: 50%;
              font-size: 13px;
            }
            .width80 {
              display: flex;
              float: left;
              width: 80%;
              font-size: 13px;
            }
            .width89 {
              display: flex;
              float: left;
              width: 89%;
              font-size: 13px;
            }
            .width100 {
              display: flex;
              float: left;
              width: 100%;
              font-size: 13px;
            }
          `
    });
  });
};

const exportPDF = () => {
  nextTick(() => {
    //当下载pdf时，若不在页面顶部会造成PDF样式不对，所以先回到页面顶部再下载
    let temp = PDF.value;
    if (temp != null) {
      temp.scrollIntoView();
      temp = null;
    }
    html2canvas(PDF.value, {
      allowTaint: true,
      useCORS: true, // 允许跨域图片加载
      dpi: 450, // 分辨率提升
      scale: 2, // 分辨率提升
    }).then(function (canvas) {
      let pageData = canvas.toDataURL('image/jpeg', 1);
      const PDF = new jsPDF('p', 'mm', 'a4');  // a4纸大小
      PDF.setPageSize = [595.28, 841.89];
      const width = PDF.internal.pageSize.getWidth();
      const height = PDF.internal.pageSize.getHeight();
      const imgProps = PDF.getImageProperties(pageData);
      const pdfWidth = imgProps.width;
      const pdfHeight = imgProps.height;
      const scale = Math.min(width / pdfWidth, height / pdfHeight);
      const x = (width - pdfWidth * scale) / 2;
      // const y = (height - pdfHeight * scale) / 16;
      const y = 0;
      PDF.addImage(pageData, 'JPEG', x, y, pdfWidth * scale, pdfHeight * scale, undefined, 'Top');
      PDF.output('dataurlnewwindow');// 预览PDF
      //PDF.save('销售合同.pdf');
    });
  });
};
</script>

<style scoped>
.a4-size {
  width: 21cm;
  height: 29.7cm;
}

div {
  width: 100%;
  margin-bottom: 0.5em;
  font-family: '宋体', sans-serif;
  line-height: 1.5;
}

table {
  border-collapse: collapse;
  width: 100%;
  font-size: 13px;
  font-family: '宋体', sans-serif;
}

th {
  text-align: center;
  white-space: nowrap;
  font-weight: bold;
  width: 100%;
}

th, td {
  border: 1px solid black;
  padding: 8px;
  text-align: center;
}

.textCenter {
  text-align: center;
}

.width11 {
  display: flex;
  float: left;
  width: 11%;
  font-size: 13px;
}

.width20 {
  display: flex;
  float: left;
  width: 20%;
  font-size: 13px;
}

.width25 {
  display: flex;
  float: left;
  width: 25%;
  font-size: 13px;
}

.width50 {
  display: flex;
  float: left;
  width: 50%;
  font-size: 13px;
}

.width80 {
  display: flex;
  float: left;
  width: 80%;
  font-size: 13px;
}

.width89 {
  display: flex;
  float: left;
  width: 89%;
  font-size: 13px;
}

.width100 {
  display: flex;
  float: left;
  width: 100%;
  font-size: 13px;
}

@media print {
  @page {
    size: A4;
  }

  div {
    width: 100%;
    margin-bottom: 20px;
  }

  .title {
    text-align: center;
    width: 100%;
    font-size: 24pt;
  }

  .width25 {
    display: flex;
    float: left;
    width: 25%;
    font-size: 13px;
  }

  .width50 {
    display: flex;
    float: left;
    width: 50%;
    font-size: 13px;
  }

  .width100 {
    display: flex;
    float: left;
    width: 100%;
    font-size: 13px;
  }
}

/* 导出PDF */
.print {
  position: fixed;
  background-color: #fff;
  color: black;
  height: 0;
  overflow: hidden;
}

.a4-size2 {
  width: 21cm;
  height: 29.7cm;
  /* box-shadow: 2cm 2cm 0 rgb(255, 255, 255); */
  padding: 1cm; /* 上下左右内边距 */
}
</style>
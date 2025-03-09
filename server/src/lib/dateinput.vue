<template>
    <div class="date-picker">
        <div class="month">
            <div
                class="input-container"
                v-if="!selectedMonth || showingMonthSelector">
                <input
                    class="month-input"
                    v-model="monthSearch"
                    @input="monthSearchChanged"
                    @keydown="handleMonthKeydown"
                    placeholder="Choose Month"
                    @blur="hideShowMonthSelector"
                    ref="monthInput"
                    @focus="showMonthSelector()" />
                <div class="dropdown month-dropdown" v-show="showingMonthSelector">
                    <div
                        class="item"
                        v-for="(monthName, index) in monthsFiltered"
                        :key="index"
                        :class="{ highlighted: highlightedMonthIndex === index }"
                        @mousedown.stop="monthSelected(index)"
                        @mouseenter="highlightedMonthIndex = index">
                        {{ monthName }}
                    </div>
                </div>
            </div>
            <div class="selected-item" v-else @click="focusMonthInput">
                {{ selectedMonth }}
            </div>
        </div>
        <div class="day" v-show="selectedMonth">
            <div class="input-container" v-show="showingDaySelector || day === null">
                <input
                    class="day-input"
                    v-model="daySearch"
                    @input="daySearchChanged"
                    @focus="showingDaySelector = true"
                    @keydown="handleDayKeydown"
                    placeholder="Choose Day"
                    @blur="showingDaySelector = false"
                    ref="dayInput" />
                <div class="dropdown day-dropdown" v-show="showingDaySelector">
                    <div
                        class="item"
                        v-for="day in daysFiltered"
                        :key="day"
                        :class="{ highlighted: highlightedDay === day }"
                        @mousedown.stop="daySelected(day)">
                        {{ day }}
                    </div>
                </div>
            </div>
            <div
                v-show="day && !showingDaySelector"
                @click="showDaySelector"
                class="selected-item selected-day">
                {{ day }}
            </div>
        </div>
        <div v-if="year" class="selected-item selected-year">{{ year }}</div>
    </div>
</template>
  
<script>
export default {
    data() {
        return {
            months: Array.from({ length: 12 }, (_, i) =>
                new Date(0, i).toLocaleString('en-US', { month: 'long' })
            ),
            showingDaySelector: false,
            showingMonthSelector: false,
            monthSearch: '',
            selectedMonth: null,
            daySearch: '',
            day: null,
            highlightedMonthIndex: -1,
            highlightedDay: -1,
            showingDaySelector: false,
            year: '',
        };
    },
    computed: {
        monthsFiltered() {
            if (!this.monthSearch) return this.months;
            return this.months.filter((month) =>
                month.toLowerCase().startsWith(this.monthSearch.toLowerCase())
            );
        },
        daysFiltered() {
            const daysInMonth = this.selectedMonth === '02' ? 29 : 31;
            return Array.from({ length: daysInMonth }, (_, i) => i + 1);
        },
    },
    methods: {
        hideShowMonthSelector() {
            this.showingMonthSelector = false;
        },
        showMonthSelector() {
            this.highlightedMonthIndex = 0;
            this.showingMonthSelector = true;
            this.$nextTick(() => this.$el.querySelector('.month-input').focus());
        },
        showDaySelector() {
            this.highlightedDay = 1;
            this.showingDaySelector = true;
            setTimeout(() => this.$nextTick(() => this.$el.querySelector('.day-input').focus()), 10);
        },
        monthSearchChanged() {
            this.showingMonthSelector = true;
            this.highlightedMonthIndex = 0;
        },
        daySearchChanged() {
            this.showingDaySelector = true;
        },
        monthSelected(index) {
            this.selectedMonth = this.monthsFiltered[index];
            this.monthSearch = '';
            this.showingMonthSelector = false;
            if (this.day === null) {
                this.showDaySelector();
            }
        },
        daySelected(day) {
            this.day = day;
            this.showingDaySelector = false;
            this.guessYear();
        },
        handleMonthKeydown(event) {
            const itemsCount = this.monthsFiltered.length;
            if (
                event.key === 'ArrowDown' &&
                this.highlightedMonthIndex < itemsCount - 1
            ) {
                this.highlightedMonthIndex++;
            } else if (event.key === 'ArrowUp' && this.highlightedMonthIndex > 0) {
                this.highlightedMonthIndex--;
            } else if (event.key === 'Enter' && this.highlightedMonthIndex !== -1) {
                this.monthSelected(this.highlightedMonthIndex);
            }
        },
        handleDayKeydown(event) {
            const daysCount = this.daysFiltered.length;
            if (event.key === 'ArrowDown' && this.highlightedDay < daysCount) {
                this.highlightedDay++;
            } else if (event.key === 'ArrowUp' && this.highlightedDay > 1) {
                this.highlightedDay--;
            } else if (event.key === 'Enter' && this.highlightedDay !== -1) {
                this.daySelected(this.highlightedDay);
            }
        },
        guessYear() {
            if (this.monthSelected === null || !this.daySelected === null) return;
            let monthIndex = this.months.indexOf(this.selectedMonth);
            let date = new Date();
            if (
                monthIndex < date.getMonth() ||
                (monthIndex === date.getMonth() && this.day < date.getDate())
            ) {
                this.year = date.getFullYear() + 1;
            } else {
                this.year = date.getFullYear();
            }
        },
        focusMonthInput() {
            console.log('focus month selector');
            this.showingMonthSelector = true;
            console.log(this.showingMonthSelector);
            this.$nextTick(() => this.$el.querySelector('.month-input').focus());
        },
        resetMonthSelection() {
            this.selectedMonth = null;
            this.daySearch = '';
            this.focusMonthInput();
        },
    },
};
</script>
  
<style lang="scss">
.date-picker {
    position: relative;
    font-family: 'Arial', sans-serif;
    display: flex;
    .input-container {
        position: relative;
    }
    input {
        width: 100px;
        padding: 8px;
        margin: 5px 0;
        border: 1px solid #ccc;
        border-radius: 4px;
        &:focus {
            outline: none;
            border-color: #007bff;
        }
    }
    .dropdown {
        position: absolute;
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        width: calc(100% - 2px);
        max-height: 200px;
        overflow-y: auto;
        z-index: 10;
        .item {
            list-style-type: none;
            padding: 8px;
            cursor: pointer;
            &:hover,
            &.highlighted {
                background-color: silver;
            }
        }
    }
    .selected-day,
    .selected-year {
        border-left: 1px solid silver;
    }
    .selected-item {
        display: inline-block;
        padding: 8px;
        margin: 5px 0;
        background: #e9ecef;
        cursor: pointer;
    }
}
</style>
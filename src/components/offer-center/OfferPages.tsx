import Image from "next/image";
import {
  buildWorkFormat,
  displayDate,
  getOfferPages,
  getPaymentRows,
  type OfferDraft,
  type OfferTask,
} from "./offer-model";
import styles from "./OfferCenterBuilder.module.css";

const ASSET_ROOT = "/offer-assets";

function InfoBlock({
  icon,
  label,
  children,
}: {
  icon: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.info}>
      <div className={styles.label}>
        <Image src={`${ASSET_ROOT}/${icon}`} width={22} height={22} alt="" unoptimized />
        {label}
      </div>
      <div className={styles.value}>{children}</div>
    </div>
  );
}

function BrandHeader() {
  return (
    <>
      <Image
        className={styles.topBand}
        src={`${ASSET_ROOT}/pattern-small.png`}
        width={1238}
        height={429}
        alt=""
        unoptimized
        priority
      />
      <Image
        className={styles.logo}
        src={`${ASSET_ROOT}/logo.png`}
        width={548}
        height={118}
        alt="ivideon"
        unoptimized
        priority
      />
      <Image
        className={styles.jobOffer}
        src={`${ASSET_ROOT}/job-offer.png`}
        width={639}
        height={121}
        alt="Job offer"
        unoptimized
        priority
      />
    </>
  );
}

function BrandFooter({ answerDate }: { answerDate: string }) {
  return (
    <>
      <Image
        className={styles.footBand}
        src={`${ASSET_ROOT}/pattern-large.png`}
        width={1237}
        height={514}
        alt=""
        unoptimized
        priority
      />
      <div className={styles.footerTitle}>
        Будем рады видеть
        <br />
        тебя в команде!
      </div>
      <div className={styles.footerDate}>Ждём твой ответ до {displayDate(answerDate)}</div>
      <div className={styles.confidential}>
        <Image
          src={`${ASSET_ROOT}/icon-conf.png`}
          width={42}
          height={42}
          alt=""
          unoptimized
        />
        <span>
          это сообщение конфиденциально
          <br />и не предназначено для распространения
        </span>
      </div>
      <Image
        className={styles.robot}
        src={`${ASSET_ROOT}/robot.png`}
        width={494}
        height={504}
        alt=""
        unoptimized
        priority
      />
    </>
  );
}

function FirstPage({ draft }: { draft: OfferDraft }) {
  const paymentRows = getPaymentRows(draft);
  return (
    <section
      className={styles.offerPage}
      aria-label="Предпросмотр оффера, страница 1"
      data-offer-page
    >
      <BrandHeader />
      <div
        className={styles.firstPageContent}
        data-overflow-check
        data-overflow-label="Основная страница"
      >
        <h2 className={styles.hello}>{draft.candidateName.trim() || "[Имя]"}, привет!</h2>
        <div className={styles.intro}>Мы приглашаем тебя в команду ivideon на позицию</div>
        <div className={styles.rolePill}>{draft.position.trim() || "[Должность]"}</div>

        <h3 className={styles.sectionTitle}>Вот что мы предлагаем:</h3>
        <div className={styles.infoGrid}>
          <InfoBlock icon="icon-dept.png" label="Подразделение">
            {draft.department.trim() || "—"}
          </InfoBlock>
          <InfoBlock icon="icon-date.png" label="Дата выхода">
            {displayDate(draft.startDate)}
          </InfoBlock>
          <InfoBlock icon="icon-format.png" label="Формат">
            {buildWorkFormat(draft)}
          </InfoBlock>
          <InfoBlock icon="icon-manager.png" label="Руководитель">
            {draft.manager.trim() || "—"}
            <br />
            {draft.managerRole.trim() || "—"}
          </InfoBlock>
        </div>

        <div className={`${styles.label} ${styles.payLabel}`}>
          <Image
            src={`${ASSET_ROOT}/icon-pay.png`}
            width={43}
            height={42}
            alt=""
            unoptimized
          />
          Оплата труда
        </div>
        <div className={styles.payBox}>
          {paymentRows.map((row, index) => (
            <div
              className={row.main ? `${styles.payRow} ${styles.payRowMain}` : styles.payRow}
              key={`${index}-${row.text}`}
            >
              {row.text}
            </div>
          ))}
        </div>

        <div className={styles.benefits}>
          <span className={styles.benefitItem}>
            <strong>ДМС</strong>
            <span>Страховая компания &laquo;Лучи&raquo;</span>
          </span>
          <span className={styles.plus}>+</span>
          <span className={styles.benefitItem}>
            <strong>Английский язык</strong>
            <span>SkyEng</span>
          </span>
        </div>
      </div>
      <BrandFooter answerDate={draft.answerDate} />
    </section>
  );
}

function TaskCard({ item, number }: { item: OfferTask; number: number }) {
  const result = item.result.trim();
  return (
    <article className={styles.taskCard}>
      <div className={styles.taskHead}>
        <span className={styles.taskNumber}>{number}</span>
        <span className={styles.taskLabel}>Задача</span>
      </div>
      <div className={styles.taskText}>{item.task.trim()}</div>
      {result ? (
        <div className={styles.resultBlock}>
          <div className={styles.resultLabel}>Ожидаемый результат</div>
          <div className={styles.resultText}>{result}</div>
        </div>
      ) : null}
    </article>
  );
}

function TaskPage({
  draft,
  tasks,
  pageIndex,
}: {
  draft: OfferDraft;
  tasks: OfferTask[];
  pageIndex: number;
}) {
  const precedingCount = pageIndex * 4;
  return (
    <section
      className={`${styles.offerPage} ${styles.taskPage}`}
      aria-label={`Предпросмотр оффера, страница ${pageIndex + 2}`}
      data-offer-page
    >
      <Image
        className={styles.taskTopBand}
        src={`${ASSET_ROOT}/pattern-small.png`}
        width={1238}
        height={429}
        alt=""
        unoptimized
        priority
      />
      <Image
        className={styles.taskLogo}
        src={`${ASSET_ROOT}/logo.png`}
        width={548}
        height={118}
        alt="ivideon"
        unoptimized
        priority
      />
      <div className={styles.taskPageLabel}>JOB OFFER</div>

      <div
        className={styles.taskContent}
        data-overflow-check
        data-overflow-label={`Страница задач ${pageIndex + 1}`}
      >
        <h3 className={styles.taskSectionTitle}>
          {pageIndex === 0 ? "Твои задачи" : "Твои задачи — продолжение"}
        </h3>
        {pageIndex === 0 && draft.tasksSubtitle.trim() ? (
          <div className={styles.taskSubtitle}>{draft.tasksSubtitle.trim()}</div>
        ) : null}
        {pageIndex === 0 ? (
          <div className={`${styles.rolePill} ${styles.taskRolePill}`}>
            {draft.position.trim() || "[Должность]"}
          </div>
        ) : null}
        <div className={styles.taskList}>
          {tasks.map((item, itemIndex) => (
            <TaskCard
              item={item}
              number={precedingCount + itemIndex + 1}
              key={item.id}
            />
          ))}
        </div>
      </div>

      <Image
        className={styles.taskFootBand}
        src={`${ASSET_ROOT}/pattern-large.png`}
        width={1237}
        height={514}
        alt=""
        unoptimized
        priority
      />
    </section>
  );
}

export function OfferPages({ draft }: { draft: OfferDraft }) {
  const taskPages = getOfferPages(draft);
  return (
    <>
      <FirstPage draft={draft} />
      {taskPages.map((tasks, pageIndex) => (
        <TaskPage
          draft={draft}
          tasks={tasks}
          pageIndex={pageIndex}
          key={tasks.map((item) => item.id).join("-") || `empty-${pageIndex}`}
        />
      ))}
    </>
  );
}
